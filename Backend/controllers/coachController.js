const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Coach = require("../models/coachModel.js");
const ErrorHandler = require("../utils/errorHandler.js");
const sendEmail = require("../utils/sendEmail.js");
const signInToken = require("../utils/signInToken.js");
const crypto = require("crypto");

//getAllCoachs --admin
exports.getAllCoachs = async (req, res, next) => {
  const coaches = await Coach.find();

  res.status(200).json({
    success: true,
    coaches,
  });
};

//registerCoach
exports.registerCoach = catchAsyncErrors(async (req, res, next) => {
  const {
    CoachId,
    Name,
    Password,
    Gender,
    DateOfBirth,
    Email,
    MobileNumber,
    Speciality,
  } = req.body;

  const coach = await Coach.create({
    CoachId,
    Name,
    Password,
    Gender,
    DateOfBirth,
    Email,
    MobileNumber,
    Speciality,
  });

  res.status(200).json({
    success: true,
    coach,
  });
});

// Get Coach Details
exports.getCoachDetails = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findById(req.params.id);

  if (!coach) {
    return next(
      new ErrorHandler(`Coach does not exist with Id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    coach,
  });
});

// Get login Coach Details
exports.getMyDetails = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findById(req.coach.id);

  console.log(req.coach);

  if (!coach) {
    return next(
      new ErrorHandler(`Coach does not exist with Id: ${req.coach.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    coach,
  });
});

//update Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findById(req.params.id);

  if (!coach) {
    return next(
      new ErrorHandler(`Coach does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const new_coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Coach Updated Successfully",
    new_coach,
  });
});

// update Coach password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findById(req.coach.id).select("+Password");

  console.log(coach)

  const isPasswordMatched = await coach.comparePassword(req.body.OldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.NewPassword !== req.body.ConfirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  coach.Password = req.body.NewPassword;

  await coach.save();

  signInToken(coach, 200, res);
});

// Delete Coach
exports.deleteCoach = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findById(req.params.id);

  if (!coach) {
    return next(
      new ErrorHandler(`Coach does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const deletedCoach = await Coach.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Coach Deleted Successfully",
    deletedCoach,
  });
});

//login Coach
exports.loginCoach = catchAsyncErrors(async (req, res, next) => {
  const { CoachId, Password } = req.body;

  if (!CoachId || !Password) {
    return next(new ErrorHandler("Please Enter CoachID & Password", 400));
  }

  const coach = await Coach.findOne({ CoachId }).select("+Password");

  if (!coach) {
    return next(new ErrorHandler("Invalid CoachId or Password", 401));
  }

  const isPasswordMatched = await coach.comparePassword(Password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid CoachId or Password", 401));
  }

  signInToken(coach, 200, res);
});

//logout Coach
exports.logoutCoach = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const coach = await Coach.findOne({ Email: req.body.Email });

  if (!coach) {
    return next(new ErrorHandler("Coach not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = coach.getResetPasswordToken();

  await coach.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/coach/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: coach.Email,
      subject: `WeCare Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${coach.Email} successfully`,
    });
  } catch (error) {
    coach.resetPasswordToken = undefined;
    coach.resetPasswordExpire = undefined;

    await coach.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(resetPasswordToken);

  const coach = await Coach.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(coach);

  if (!coach) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.Password !== req.body.ConfirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  coach.Password = req.body.Password;
  coach.resetPasswordToken = undefined;
  coach.resetPasswordExpire = undefined;

  await coach.save();

  signInToken(coach, 200, res);
});
