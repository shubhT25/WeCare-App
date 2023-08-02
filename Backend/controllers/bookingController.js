const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Coach = require("../models/coachModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const Booking = require("../models/bookingModel");

exports.getAllBookings = catchAsyncErrors(async (req, res, next) => {
  const bookings = Booking.find();

  res.status(200).json({
    success: true,
    bookings,
  });
});

exports.getUserBookings = catchAsyncErrors(async (req, res, next) => {
  const UserId = req.params.userId;

  const user = await User.findOne({ UserId });

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${UserId}`, 400)
    );
  }
  console.log(user)

  const userBookings = await Booking.find({ UserId });

  console.log(userBookings)

  res.status(200).json({
    success: true,
    userBookings
  })
});

exports.getCoachBookings = catchAsyncErrors(async (req, res, next) => {
  const CoachId = req.params.coachId;

  const coach = await Coach.findOne({ CoachId });

  console.log(coach)

  if (!coach) {
    return next(
      new ErrorHandler(`Coach does not exist with Id: ${CoachId}`, 400)
    );
  }

  const coachBookings = await Booking.find({ CoachId });

  res.status(200).json({
    success: true,
    coachBookings
  })
});

exports.bookAppointment = catchAsyncErrors(async (req, res, next) => {
  const UserId = req.params.userId;
  const CoachId = req.params.coachId;
  const { BookingId, DateOfAppointment, Slot } = req.body;

  const user = await User.findOne({ UserId });

  if (req.user.UserId !== UserId) {
    return next(
      new ErrorHandler(`User needs to login to book appointment`, 400)
    );
  }

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.userId}`, 400)
    );
  }

  const userBooking = await Booking.findOne({
    UserId,
    Slot,
    DateOfAppointment,
  });

  if (userBooking) {
    return next(
      new ErrorHandler(`User has already booking in slot ${Slot}`, 400)
    );
  }

  const coach = await Coach.findOne({ CoachId });

  if (!coach) {
    return next(
      new ErrorHandler(
        `Coach does not exist with Id: ${req.params.coachId}`,
        400
      )
    );
  }

  const coachBooking = await Booking.findOne({
    CoachId,
    Slot,
    DateOfAppointment,
  });

  if (coachBooking) {
    return next(
      new ErrorHandler(`Coach has already booking in slot ${Slot}`, 400)
    );
  }

  const booking = await Booking.create({
    BookingId,
    UserId,
    CoachId,
    DateOfAppointment,
    Slot,
  });

  res.status(200).json({
    success: true,
    booking,
  });
});

exports.getBooking = catchAsyncErrors(async (req, res, next) => {
  const BookingId = req.params.bookingId;

  const booking = await Booking.findOne({ BookingId });

  if (!booking) {
    return next(new ErrorHandler(`Booking for ${BookingId} not found`, 400));
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

exports.deleteBooking = catchAsyncErrors(async (req, res, next) => {
  const BookingId = req.params.bookingId;

  const booking = await Booking.findOne({ BookingId });

  if (!booking) {
    return next(new ErrorHandler(`Booking for ${BookingId} not found`, 400));
  }

  const deletedBooking = await Booking.findOneAndDelete({ BookingId });

  res.status(200).json({
    success: true,
    deletedBooking,
  });
});

exports.rescheduleAppointment = catchAsyncErrors(async (req, res, next) => {
  const BookingId = req.params.bookingId;
  const DateOfAppointment = req.body.DateOfAppointment;
  const Slot = req.body.Slot;

  const booking = await Booking.findOne({ BookingId });

  if (!booking) {
    return next(new ErrorHandler(`Booking for ${BookingId} not found`, 400));
  }

  const UserId = booking.UserId;
  const CoachId = booking.CoachId;

  const user = await User.findOne({ UserId });

  if (!user) {
    return next(
      new ErrorHandler(`User not found for booking ${BookingId}`, 400)
    );
  }

  const userBooking = await Booking.findOne({
    UserId,
    Slot,
    DateOfAppointment,
  });

  if (userBooking) {
    return next(
      new ErrorHandler(`User have already booking in this slot`, 400)
    );
  }

  const coach = await Coach.findOne({ CoachId });

  if (!coach) {
    return next(
      new ErrorHandler(`Coach not found for booking ${BookingId}`, 400)
    );
  }

  const coachBooking = await Booking.findOne({
    CoachId,
    Slot,
    DateOfAppointment,
  });

  if (coachBooking) {
    return next(
      new ErrorHandler(`Coach have already booking in this slot`, 400)
    );
  }

  const rescheduledBooking = await Booking.findByIdAndUpdate(
    booking._id,
    {
      DateOfAppointment,
      Slot,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    rescheduledBooking,
  });
});
