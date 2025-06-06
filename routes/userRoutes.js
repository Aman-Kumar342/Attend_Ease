const express=require('express');
const {registerUser, loginUser, getProfile, updateProfile, getAllUsers}=require('../controllers/userController'); // Added getAllUsers
const {validateRegistration, validateLogin, handleValidationErrors,}=require('../middlewares/validation');   
const {authenticate,authorize} = require('../middlewares/auth');

const router=express.Router();

//POST/api/users/register
router.post('/register',
    validateRegistration,
    handleValidationErrors,
    registerUser    
);

// POST /api/users/login
router.post('/login',
    validateLogin,
    handleValidationErrors,
    loginUser
);  

// Protected routes (require authentication)
router.get('/profile',
    authenticate,
    getProfile
);

router.put('/profile',
    authenticate,
    updateProfile
);

// Admin-only route to get all users
router.get('/all',
    authenticate,
    authorize('admin'),  
    getAllUsers          
);

// Export the router
module.exports=router;
