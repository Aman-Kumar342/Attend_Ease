const User = require('../models/User');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalUsers,
      totalSeats,
      activeSeats,
      occupiedSeats,
      todayBookings,
      activeBookings,
      completedBookings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Seat.countDocuments(),
      Seat.countDocuments({ isActive: true }),
      Seat.countDocuments({ isOccupied: true }),
      Booking.countDocuments({ 
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
      }),
      Booking.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'completed' })
    ]);

    // Get current occupancy rate
    const occupancyRate = activeSeats > 0 ? ((occupiedSeats / activeSeats) * 100).toFixed(1) : 0;

    // Get today's check-ins
    const todayCheckins = await Booking.countDocuments({
      checkInTime: { $gte: today },
      status: { $in: ['checked-in', 'completed'] }
    });

    // Get weekly statistics
    const weeklyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thisWeek },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          totalDuration: { $sum: '$actualDuration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get popular seats
    const popularSeats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$seat',
          bookingCount: { $sum: 1 },
          totalDuration: { $sum: '$actualDuration' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'seats',
          localField: '_id',
          foreignField: '_id',
          as: 'seatInfo'
        }
      },
      { $unwind: '$seatInfo' }
    ]);

    // Get user activity stats
    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          totalSeats,
          activeSeats,
          occupiedSeats,
          occupancyRate: parseFloat(occupancyRate),
          todayBookings,
          todayCheckins,
          activeBookings,
          completedBookings
        },
        weeklyStats,
        popularSeats,
        topUsers: userStats
      }
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving dashboard statistics'
    });
  }
};

// Get detailed analytics
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Booking trends
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: { 
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          }
        };
        break;
      case 'month':
        groupStage = {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }
        };
        break;
      default: // day
        groupStage = {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        };
    }

    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          ...groupStage,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalDuration: { $sum: '$actualDuration' },
          avgDuration: { $avg: '$actualDuration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Peak hours analysis
    const peakHours = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          checkInTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: { $hour: '$checkInTime' },
          checkinCount: { $sum: 1 }
        }
      },
      { $sort: { checkinCount: -1 } }
    ]);

    // Seat type utilization
    const seatTypeStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'seats',
          localField: 'seat',
          foreignField: '_id',
          as: 'seatInfo'
        }
      },
      { $unwind: '$seatInfo' },
      {
        $group: {
          _id: '$seatInfo.seatType',
          bookingCount: { $sum: 1 },
          totalDuration: { $sum: '$actualDuration' },
          avgDuration: { $avg: '$actualDuration' }
        }
      },
      { $sort: { bookingCount: -1 } }
    ]);

    // Floor utilization
    const floorStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'seats',
          localField: 'seat',
          foreignField: '_id',
          as: 'seatInfo'
        }
      },
      { $unwind: '$seatInfo' },
      {
        $group: {
          _id: '$seatInfo.floor',
          bookingCount: { $sum: 1 },
          totalDuration: { $sum: '$actualDuration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        dateRange: { start, end },
        bookingTrends,
        peakHours,
        seatTypeStats,
        floorStats
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving analytics'
    });
  }
};

// Get user management data
const getUserManagement = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    // Build filter
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status !== undefined) filter.isActive = status === 'active';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with booking statistics
    const users = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          cancelledBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'cancelled'] }
              }
            }
          },
          totalStudyTime: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: '$$booking.actualDuration'
              }
            }
          },
          lastBooking: {
            $max: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: '$$booking.createdAt'
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'User management data retrieved successfully',
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting user management data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user management data'
    });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If deactivating user, cancel their active bookings
    if (!isActive) {
      await Booking.updateMany(
        { user: userId, status: 'active' },
        { status: 'cancelled' }
      );
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

// Get real-time library status
const getLibraryStatus = async (req, res) => {
  try {
    const now = new Date();

    // Current occupancy
    const [totalSeats, occupiedSeats, activeBookings] = await Promise.all([
      Seat.countDocuments({ isActive: true }),
      Seat.countDocuments({ isOccupied: true }),
      Booking.find({
        status: { $in: ['active', 'checked-in'] },
        startTime: { $lte: now },
        endTime: { $gte: now }
      })
      .populate('user', 'name email')
      .populate('seat', 'seatNumber floor section seatType')
      .sort({ startTime: 1 })
    ]);

    // Upcoming bookings (next 2 hours)
    const upcomingBookings = await Booking.find({
      status: 'active',
      startTime: { 
        $gte: now,
        $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000)
      }
    })
    .populate('user', 'name email')
    .populate('seat', 'seatNumber floor section seatType')
    .sort({ startTime: 1 })
    .limit(10);

    // Recent check-ins (last 1 hour)
    const recentCheckins = await Booking.find({
      checkInTime: {
        $gte: new Date(now.getTime() - 60 * 60 * 1000),
        $lte: now
      }
    })
    .populate('user', 'name email')
    .populate('seat', 'seatNumber floor section seatType')
    .sort({ checkInTime: -1 })
    .limit(10);

    const occupancyRate = totalSeats > 0 ? ((occupiedSeats / totalSeats) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      message: 'Real-time library status retrieved successfully',
      data: {
        occupancy: {
          totalSeats,
          occupiedSeats,
          availableSeats: totalSeats - occupiedSeats,
          occupancyRate: parseFloat(occupancyRate)
        },
        activeBookings,
        upcomingBookings,
        recentCheckins,
        lastUpdated: now
      }
    });

  } catch (error) {
    console.error('Error getting library status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving library status'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getUserManagement,
  updateUserStatus,
  getLibraryStatus
};
