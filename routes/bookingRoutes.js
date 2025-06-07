const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBooking, handleBookingValidationErrors } = require('../middlewares/bookingValidation');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// User routes
router.post('/', validateBooking, handleBookingValidationErrors, createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

// Admin routes
router.get('/', authorize('admin'), getAllBookings);

module.exports = router;
