const express = require('express');
const{
    generateBookingReport,
    generateUserReport,
    generateSeatReport

}=require('../controllers/reportController');
const {
    authenticate,
    authorize
} = require('../middlewares/auth');

const router=express.Router();

// All report routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin')); 

//Report generation endpoints
router.get('/bookings', generateBookingReport);
router.get('/users', generateUserReport);
router.get('/seats', generateSeatReport);

module.exports = router;
    
