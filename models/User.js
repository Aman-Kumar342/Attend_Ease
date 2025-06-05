const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name'],
        trim:true,
        maxlength:[50,'Name cannot exceed 50 characters']
    },
    email:{
        type:String,
        required:[true,'Please enter your email'],
        unique:true,
        trim:true,
        lowercase:true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
       
    },
    phone:{
        type:String,
        required:[true,'Please enter your phone number'],
        match:[/^[0-9]{10}$/, 'Please enter a valid phone number']
    },
    role:{
        type:String,
        enum:['student', 'admin'],
        default:'student'
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, {
    timestamps:true
});
module.exports=mongoose.model('User', userSchema);