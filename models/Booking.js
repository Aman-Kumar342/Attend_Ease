const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: [true, 'Seat is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['active', 'checked-in', 'completed', 'cancelled', 'no-show'],
    default: 'active'
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  qrCode: {
    type: String, // Base64 data URL or SVG string
    default: null
  },
  qrData: {
    type: String, // JSON string for QR scanning
    default: null
  },
  attendanceNotes: {
    type: String,
    maxlength: [500, 'Attendance notes cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Validate that end time is after start time
bookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Calculate actual duration when checking out
bookingSchema.methods.calculateDuration = function() {
  if (this.checkInTime && this.checkOutTime) {
    this.actualDuration = Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60));
  }
};

// Check if booking is currently active (within time slot)
bookingSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startTime && now <= this.endTime;
};

// Check if booking can be checked in
bookingSchema.methods.canCheckIn = function() {
  const now = new Date();
  const thirtyMinsBefore = new Date(this.startTime.getTime() - 30 * 60 * 1000);
  
  return this.status === 'active' && 
         now >= thirtyMinsBefore && 
         now <= this.endTime &&
         !this.checkInTime;
};

// Check if booking can be checked out
bookingSchema.methods.canCheckOut = function() {
  return this.status === 'checked-in' && 
         this.checkInTime && 
         !this.checkOutTime;
};

// Indexes for better performance
bookingSchema.index({ user: 1, startTime: -1 });
bookingSchema.index({ seat: 1, startTime: 1 });
bookingSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
