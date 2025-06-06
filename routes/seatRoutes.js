const express=require('express');
const{
    createSeat,
    getAllSeats,
    getSeatById,
    updateSeat,
    deleteSeat
}=require('../controllers/seatController');
const {authenticate, authorize} = require('../middlewares/auth');
const router=express.Router();

//Public routes (anyone can view seats)

router.get('/',getAllSeats);
router.get('/:id',getSeatById);

//Admin only routes (require authentication and admin role)
router.post('/',
    authenticate,
    authorize('admin'),
    createSeat
);  
router.put('/:id',
    authenticate,
    authorize('admin'),
    updateSeat
);
router.delete('/:id',
    authenticate,
    authorize('admin'),
    deleteSeat
);  

module.exports=router;
