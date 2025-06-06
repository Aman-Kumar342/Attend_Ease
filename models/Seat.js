const mongoose =require('mongoose');
const seatSchema=new mongoose.Schema({
    seatNumber:{
        type:String,
        required:[true,'Seat number is required'],
        unique:true,
        trim:true,
        uppercase:true
    },
    seatType:{
        type:String,
        enum:['regular','premium','window','corner'],
        default:'regular'
    },
    floor:{
        type:Number,
        required:[true,'floor number is required'],
        min:[1,'floor number must be at least 1'],

    },
    section:{
        type:String,
        required:[true,'Section is required'],
        trim:true,
        uppercase:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isOccupied:{
        type:Boolean,
        default:false
    },
    description:{
        type:String,
        maxlength:[200,'Description cannot exceed 200 charaters']
    }
},{
    timestamps:true

});

// Index for faster queries
seatSchema.index({ floor: 1, section: 1 });
seatSchema.index({ isActive: 1, isOccupied: 1 });

module.exports = mongoose.model('Seat', seatSchema);