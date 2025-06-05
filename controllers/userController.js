const user=require('../models/User');
const bcrypt=require('bcryptjs');


//Register new User

const registerUser=async(req,res)=>{
    try{
        const{name,email,phone,role}=req.body;

        //check if user already exissts

        const existingUser=await User.findOne({
            $or:[{email:email},{phone:phone}]
        });
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone number'
            }); 
    }

    //create new user
    const user=new User({
        name,
        email,
        phone,
        role:role || 'student', //default role is student
    });
    await user.save();
    
    //return user data without sensitive information
    
    const userResponse={
        id:user,_id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role,
        isActive:user.isActive,
        createdAt:user.createdAt,
    };
    res.status(201).json({
        success:true,
        message:'User registered successfully',
        data:userResponse
    });
}
catch(error){
    console.error('Error registering user:', error);
    res.status(500).json({
        success:false,
        message:'Server error while registering user',
        error:process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
}
};
module.exports = {
    registerUser
};