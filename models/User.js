const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

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
    password:{
        type:String,
        required:[true,'Please enter your password'],
        minlength:[6,'Password must be at least 6 characters'],
        // select:false // Exclude password from queries by default
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

//hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try{
        // hash the password with the cost of 12 
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);    
    }
});


//compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports=mongoose.model('User', userSchema);