const express = require('express');
const { bookAppointment, rescheduleAppointment, getBooking, deleteBooking, getAllBookings, getUserBookings, getCoachBookings } = require('../controllers/bookingController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route("/bookings").get(getAllBookings)
router.route("/user/booking/:userId/:coachId").post(isAuthenticatedUser, bookAppointment)
router.route("/booking/:bookingId").get(getBooking
    ).delete(deleteBooking).put(rescheduleAppointment)
router.route("/bookings/user/:userId").get(getUserBookings)
router.route("/bookings/coach/:coachId").get(getCoachBookings)

module.exports = router