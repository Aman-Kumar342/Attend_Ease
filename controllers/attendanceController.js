const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { generateBookingQR, parseQRData } = require('../utils/qrCode');

// Generate QR code for booking
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params; // booking ID
    const userId = req.user._id;

    // Find booking
    const booking = await Booking.findById(id)
      .populate('seat', 'seatNumber floor section')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only generate QR for your own bookings.'
      });
    }

    // Check if booking is valid for QR generation
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot generate QR for ${booking.status} booking`
      });
    }

    // Generate QR code
    const { qrCode, qrData } = await generateBookingQR(booking._id);

    // Update booking with QR code
    booking.qrCode = qrCode;
    booking.qrData = qrData;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        bookingId: booking._id,
        qrCode: qrCode,
        booking: {
          seat: booking.seat,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating QR code'
    });
  }
};

// Check-in using QR code
const checkIn = async (req, res) => {
  try {
    const { qrData } = req.body;
    const userId = req.user._id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = parseQRData(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Find booking
    const booking = await Booking.findById(parsedData.bookingId)
      .populate('seat', 'seatNumber floor section')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns this booking
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This QR code belongs to a different user'
      });
    }

    // Check if booking can be checked in
    if (!booking.canCheckIn()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be checked in at this time',
        details: {
          status: booking.status,
          startTime: booking.startTime,
          endTime: booking.endTime,
          alreadyCheckedIn: !!booking.checkInTime
        }
      });
    }

    // Perform check-in
    const now = new Date();
    booking.checkInTime = now;
    booking.status = 'checked-in';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: {
        bookingId: booking._id,
        checkInTime: booking.checkInTime,
        seat: booking.seat,
        user: booking.user.name,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in'
    });
  }
};

// Check-out using QR code
const checkOut = async (req, res) => {
  try {
    const { qrData, notes } = req.body;
    const userId = req.user._id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = parseQRData(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Find booking
    const booking = await Booking.findById(parsedData.bookingId)
      .populate('seat', 'seatNumber floor section')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns this booking
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This QR code belongs to a different user'
      });
    }

    // Check if booking can be checked out
    if (!booking.canCheckOut()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be checked out',
        details: {
          status: booking.status,
          checkedIn: !!booking.checkInTime,
          alreadyCheckedOut: !!booking.checkOutTime
        }
      });
    }

    // Perform check-out
    const now = new Date();
    booking.checkOutTime = now;
    booking.status = 'completed';
    booking.attendanceNotes = notes || '';
    
    // Calculate actual duration
    booking.calculateDuration();
    await booking.save();

    // Free up the seat
    await Seat.findByIdAndUpdate(booking.seat._id, { isOccupied: false });

    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: {
        bookingId: booking._id,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        actualDuration: booking.actualDuration,
        seat: booking.seat,
        user: booking.user.name,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-out'
    });
  }
};

// Get attendance history for user
const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    let filter = { 
      user: userId,
      checkInTime: { $exists: true } // Only bookings that were checked in
    };
    
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendanceRecords = await Booking.find(filter)
      .populate('seat', 'seatNumber floor section seatType')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Calculate statistics
    const stats = await Booking.aggregate([
      { $match: { user: userId, checkInTime: { $exists: true } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$actualDuration' },
          avgDuration: { $avg: '$actualDuration' },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Attendance history retrieved successfully',
      data: attendanceRecords,
      statistics: stats[0] || {
        totalSessions: 0,
        totalDuration: 0,
        avgDuration: 0,
        completedSessions: 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + attendanceRecords.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving attendance history'
    });
  }
};

module.exports = {
  generateQRCode,
  checkIn,
  checkOut,
  getAttendanceHistory
};
