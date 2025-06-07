const { body, validationResult } = require('express-validator');

// Validation rules for creating a booking
const validateBooking = [
  body('seat')
    .isMongoId()
    .withMessage('Please provide a valid seat ID'),
  
  body('startTime')
    .isISO8601()
    .withMessage('Please provide a valid start time in ISO format')
    .custom((value) => {
      const startTime = new Date(value);
      const now = new Date();
      if (startTime <= now) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  
  body('endTime')
    .isISO8601()
    .withMessage('Please provide a valid end time in ISO format')
    .custom((value, { req }) => {
      const endTime = new Date(value);
      const startTime = new Date(req.body.startTime);
      
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      
      // Check if booking duration is reasonable (max 8 hours)
      const duration = (endTime - startTime) / (1000 * 60 * 60); // hours
      if (duration > 8) {
        throw new Error('Booking duration cannot exceed 8 hours');
      }
      
      // Minimum 30 minutes
      if (duration < 0.5) {
        throw new Error('Booking duration must be at least 30 minutes');
      }
      
      return true;
    }),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Middleware to handle validation errors
const handleBookingValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateBooking,
  handleBookingValidationErrors
};
