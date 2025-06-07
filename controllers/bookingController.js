const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { seat, startTime, endTime, notes } = req.body;
    const userId = req.user._id;

    // Check if seat exists and is active
    const seatDoc = await Seat.findById(seat);
    if (!seatDoc) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    if (!seatDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Seat is not available for booking'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      seat: seat,
      status: 'active',
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Seat is already booked for the selected time slot',
        conflictingBooking: {
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime
        }
      });
    }

    // Check if user has any active bookings (prevent double booking)
    const userActiveBooking = await Booking.findOne({
      user: userId,
      status: 'active',
      endTime: { $gt: new Date() }
    });

    if (userActiveBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking. Please complete or cancel it first.',
        activeBooking: {
          seat: userActiveBooking.seat,
          startTime: userActiveBooking.startTime,
          endTime: userActiveBooking.endTime
        }
      });
    }

    // Create new booking
    const booking = new Booking({
      user: userId,
      seat: seat,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes: notes || ''
    });

    await booking.save();

    // Update seat occupancy status
    await Seat.findByIdAndUpdate(seat, { isOccupied: true });

    // Populate booking with seat and user details
    await booking.populate([
      { path: 'seat', select: 'seatNumber floor section seatType' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    let filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('seat', 'seatNumber floor section seatType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total,
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving bookings'
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate('seat', 'seatNumber floor section seatType')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving booking'
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Check if booking has already started (optional - you can allow this)
    const now = new Date();
    if (booking.startTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking that has already started'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Free up the seat
    await Seat.findByIdAndUpdate(booking.seat, { isOccupied: false });

    await booking.populate([
      { path: 'seat', select: 'seatNumber floor section seatType' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, seat, date, page = 1, limit = 20 } = req.query;

    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (seat) filter.seat = seat;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.startTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('seat', 'seatNumber floor section seatType')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'All bookings retrieved successfully',
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total,
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving bookings'
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
};
