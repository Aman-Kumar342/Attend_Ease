const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

// Create new seat (Admin only)
const createSeat = async (req, res) => {
  try {
    const { seatNumber, seatType, floor, section, description } = req.body;

    // Check if seat already exists
    const existingSeat = await Seat.findOne({ seatNumber });
    if (existingSeat) {
      return res.status(409).json({
        success: false,
        message: 'Seat with this number already exists'
      });
    }

    // Create new seat
    const seat = new Seat({
      seatNumber,
      seatType: seatType || 'regular',
      floor,
      section,
      description
    });

    await seat.save();

    res.status(201).json({
      success: true,
      message: 'Seat created successfully',
      data: seat
    });

  } catch (error) {
    console.error('Error creating seat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating seat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all seats with availability status
const getAllSeats = async (req, res) => {
  try {
    const { floor, section, available } = req.query;
    
    // Build filter object
    let filter = { isActive: true };
    
    if (floor) filter.floor = parseInt(floor);
    if (section) filter.section = section.toUpperCase();
    if (available === 'true') filter.isOccupied = false;
    if (available === 'false') filter.isOccupied = true;

    const seats = await Seat.find(filter).sort({ floor: 1, seatNumber: 1 });

    res.status(200).json({
      success: true,
      message: 'Seats retrieved successfully',
      count: seats.length,
      data: seats
    });

  } catch (error) {
    console.error('Error getting seats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving seats'
    });
  }
};

// Get seat by ID
const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findById(id);
    
    if (!seat) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seat retrieved successfully',
      data: seat
    });

  } catch (error) {
    console.error('Error getting seat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving seat'
    });
  }
};

// Update seat (Admin only)
const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatType, floor, section, description, isActive } = req.body;

    const seat = await Seat.findByIdAndUpdate(
      id,
      {
        ...(seatType && { seatType }),
        ...(floor && { floor }),
        ...(section && { section: section.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seat updated successfully',
      data: seat
    });

  } catch (error) {
    console.error('Error updating seat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating seat'
    });
  }
};

// Delete seat (Admin only)
const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if seat has active bookings
    const activeBookings = await Booking.find({
      seat: id,
      status: 'active'
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete seat with active bookings'
      });
    }

    const seat = await Seat.findByIdAndDelete(id);

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: 'Seat not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seat deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting seat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting seat'
    });
  }
};

module.exports = {
  createSeat,
  getAllSeats,
  getSeatById,
  updateSeat,
  deleteSeat
};
