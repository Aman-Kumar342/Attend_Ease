const{body,validationResult}=require('express-validator');


//validation rules for user registration
const validateRegistration = [
    body('name')
    .trim()
    .isLength({ min: 2,max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),

    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

    body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits long'),

    body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin'),
];
//Middleware to handle validation errors

const handleValidationErrors=(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:'Validation failed',
            errors:errors.array()
        });
    }
    next();    

};
//Export the validation middleware
module.exports = {
    validateRegistration,
    handleValidationErrors
};