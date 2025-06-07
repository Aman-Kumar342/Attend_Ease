const express = require('express');
const {
  generateQRCode,
  checkIn,
  checkOut,
  getAttendanceHistory
} = require('../controllers/attendanceController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// All attendance routes require authentication
router.use(authenticate);

// QR code generation
router.post('/generate-qr/:id', generateQRCode);

// Check-in and check-out
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

// Attendance history
router.get('/history', getAttendanceHistory);

module.exports = router;
