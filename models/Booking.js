const mongoose=require('mongoose');

const bookingSchema=new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for booking']
    },
    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: [true, 'Seat is required for booking']
    },
    startTime:{
        type: Date,
        required: [true, 'Start time is required for booking']
    },
    endTime:{
        type: Date,
        required: [true, 'End time is required for booking']
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled','no-show'],
        default: 'active'
    },
    checkIntime:{
        type:Date,
        default:null
    },
    checkOutTime:{
        type:Date,
        default:null
    },
    actualDuration:{
        type:Number,//in minutes
        default:0
    },
    notes:{
        type:String,
        maxlength:[500, 'Notes cannot exceed 500 characters'],
    }
},{
    timestamps: true
});

// Validate that end time is after the start time

bookingSchema.pre('save', function(next) {
    if (this.endTime <= this.startTime) {
        return next(new Error('End time must be after start time'));
    }
    next();
});

//Calculate actual duration  when checking out

bookingSchema.methods.calculateActualDuration = function() {
    if (this.checkOutTime && this.checkIntime) {
        const duration = (this.checkOutTime - this.checkIntime) / (1000 * 60); // Convert milliseconds to minutes
        this.actualDuration = Math.max(duration, 0); // Ensure duration is not negative
    } else {
        this.actualDuration = 0; // Reset if no check-in or check-out
    }
};

//indexes for better performance
bookingSchema.index({ user: 1, seat: 1, startTime: -1 });
bookingSchema.index({status:1,startTime:1});
bookingSchema.index({status:1,startTime:1});

module.exports=mongoose.model('Booking', bookingSchema);