const express=require('express');
const {registerUser}=require('../controllers/userController');
const {validateRegistration,handleValidationErrors}=require('../middlewares/validation');   

const router=express.Router();

//POST/api/users/register

router.post('/register',
    validateRegistration,
    handleValidationErrors,
    registerUser    
);

// Export the router

module.exports=router;