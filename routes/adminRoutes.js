const express=require('express');
const{
    getDashboardStats,
    getAnalytics,
    getUserManagement,
    updateUserStatus,
    getLibraryStatus
}=require('../controllers/adminController');

const {authenticate, authorize} = require('../middlewares/auth');
const router=express.Router();

//All admin routes require authentication and admin  role

router.use(authenticate);
router.use(authorize('admin'));

// Dashboard and analytics

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/library-status', getLibraryStatus);


// User management
router.get('/users',getUserManagement);
router.patch('/users/:userId/status', updateUserStatus);

module.exports=router;
