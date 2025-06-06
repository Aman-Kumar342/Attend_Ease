const User=require('../models/User');
const bcrypt=require('bcryptjs');
const {generateToken}=require('../utils/jwt');

//Register new User
const registerUser=async(req,res)=>{
    try{
        const{name,email,phone,password,role}=req.body; // Added password

        //check if user already exists
        const existingUser=await User.findOne({
            $or:[{email:email},{phone:phone}]
        });
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or phone number'
            }); 
        }

        //create new user
        const user=new User({
            name,
            email,
            phone,
            password, // Added password
            role:role || 'student',
        });
        await user.save();

        //generate JWT token
        const token=generateToken(user._id);

        //return user data without sensitive information
        const userResponse={
            id:user._id,
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
            data:userResponse,
            token // Added token to response
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

//login user
const loginUser=async(req,res)=>{
    try{
        const {email, password} = req.body;

        //find user and use password for confirmation
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({
                success:false,
                message:'Invalid email or password'     
            });
        }
        
        //check if user is active
        if(!user.isActive){
            return res.status(403).json({
                success:false,
                message:'Account is inactive. Please contact Admin.'
            });
        }

        //compare password
        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){ // Fixed variable name
            return res.status(401).json({
                success:false,
                message:'Invalid email or password'
            });
        }

        //generate JWT token
        const token = generateToken(user._id);

        //return user data without sensitive information
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive
        };

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: userResponse,
            token: token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while logging in user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


//get current user profile 



const getProfile = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    const user = req.user;

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    });
  }
};
// update user profile 
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user._id;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(phone && { phone })
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validations
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving users'
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers
};
