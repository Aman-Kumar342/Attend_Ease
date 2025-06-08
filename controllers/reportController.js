const Booking = require('../models/Booking');
const User = require('../models/User');
const Seat = require('../models/Seat');

// Generate booking report
const generateBookingReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      includeUser = true,
      includeSeat = true,
      status 
    } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build filter
    let filter = {
      createdAt: { $gte: start, $lte: end }
    };
    if (status) filter.status = status;

    // Build population array
    let populate = [];
    if (includeUser === 'true') {
      populate.push({ path: 'user', select: 'name email phone role' });
    }
    if (includeSeat === 'true') {
      populate.push({ path: 'seat', select: 'seatNumber floor section seatType' });
    }

    const bookings = await Booking.find(filter)
      .populate(populate)
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const summary = {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      activeBookings: bookings.filter(b => b.status === 'active').length,
      totalDuration: bookings.reduce((sum, b) => sum + (b.actualDuration || 0), 0),
      avgDuration: bookings.length > 0 ? 
        bookings.reduce((sum, b) => sum + (b.actualDuration || 0), 0) / bookings.length : 0
    };

    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = [
        'Booking ID',
        'User Name',
        'User Email',
        'Seat Number',
        'Floor',
        'Section',
        'Start Time',
        'End Time',
        'Check In Time',
        'Check Out Time',
        'Duration (mins)',
        'Status',
        'Created At'
      ];

      const csvRows = bookings.map(booking => [
        booking._id,
        booking.user?.name || 'N/A',
        booking.user?.email || 'N/A',
        booking.seat?.seatNumber || 'N/A',
        booking.seat?.floor || 'N/A',
        booking.seat?.section || 'N/A',
        booking.startTime?.toISOString() || 'N/A',
        booking.endTime?.toISOString() || 'N/A',
        booking.checkInTime?.toISOString() || 'N/A',
        booking.checkOutTime?.toISOString() || 'N/A',
        booking.actualDuration || 0,
        booking.status,
        booking.createdAt?.toISOString() || 'N/A'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="booking-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv"`);
      
      return res.send(csvContent);
    }

    // Return JSON format
    res.status(200).json({
      success: true,
      message: 'Booking report generated successfully',
      data: {
        dateRange: { start, end },
        summary,
        bookings
      }
    });

  } catch (error) {
    console.error('Error generating booking report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating booking report'
    });
  }
};

// Generate user activity report
const generateUserReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userReport = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                createdAt: { $gte: start, $lte: end }
              }
            }
          ],
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
                in: { $ifNull: ['$$booking.actualDuration', 0] }
              }
            }
          },
          avgSessionDuration: {
            $cond: {
              if: { $gt: [{ $size: '$bookings' }, 0] },
              then: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: '$bookings',
                        as: 'booking',
                        in: { $ifNull: ['$$booking.actualDuration', 0] }
                      }
                    }
                  },
                  { $size: '$bookings' }
                ]
              },
              else: 0
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    if (format === 'csv') {
      const csvHeaders = [
        'User ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'Status',
        'Total Bookings',
        'Completed Bookings',
        'Cancelled Bookings',
        'Total Study Time (mins)',
        'Avg Session Duration (mins)',
        'Member Since'
      ];

      const csvRows = userReport.map(user => [
        user._id,
        user.name,
        user.email,
        user.phone,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.totalBookings,
        user.completedBookings,
        user.cancelledBookings,
        Math.round(user.totalStudyTime),
        Math.round(user.avgSessionDuration),
        user.createdAt?.toISOString().split('T')[0] || 'N/A'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="user-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv"`);
      
      return res.send(csvContent);
    }

    res.status(200).json({
      success: true,
      message: 'User activity report generated successfully',
      data: {
        dateRange: { start, end },
        totalUsers: userReport.length,
        users: userReport
      }
    });

  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating user report'
    });
  }
};

// Generate seat utilization report
const generateSeatReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const seatReport = await Seat.aggregate([
      {
        $lookup: {
          from: 'bookings',
          let: { seatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$seat', '$$seatId'] },
                createdAt: { $gte: start, $lte: end },
                status: { $ne: 'cancelled' }
              }
            }
          ],
          as: 'bookings'
        }
      },
      {
        $project: {
          seatNumber: 1,
          seatType: 1,
          floor: 1,
          section: 1,
          isActive: 1,
          isOccupied: 1,
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          totalUsageTime: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: { $ifNull: ['$$booking.actualDuration', 0] }
              }
            }
          },
          utilizationRate: {
            $cond: {
              if: { $gt: [{ $size: '$bookings' }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $size: '$bookings' },
                      { $divide: [{ $subtract: [end, start] }, 1000 * 60 * 60 * 24] } // days in period
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    if (format === 'csv') {
      const csvHeaders = [
        'Seat ID',
        'Seat Number',
        'Type',
        'Floor',
        'Section',
        'Status',
        'Currently Occupied',
        'Total Bookings',
        'Completed Bookings',
        'Total Usage Time (mins)',
        'Utilization Rate (%)'
      ];

      const csvRows = seatReport.map(seat => [
        seat._id,
        seat.seatNumber,
        seat.seatType,
        seat.floor,
        seat.section,
        seat.isActive ? 'Active' : 'Inactive',
        seat.isOccupied ? 'Yes' : 'No',
        seat.totalBookings,
        seat.completedBookings,
        Math.round(seat.totalUsageTime),
        Math.round(seat.utilizationRate * 100) / 100
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="seat-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv"`);
      
      return res.send(csvContent);
    }

    res.status(200).json({
      success: true,
      message: 'Seat utilization report generated successfully',
      data: {
        dateRange: { start, end },
        totalSeats: seatReport.length,
        seats: seatReport
      }
    });

  } catch (error) {
    console.error('Error generating seat report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating seat report'
    });
  }
};

module.exports = {
  generateBookingReport,
  generateUserReport,
  generateSeatReport
};
