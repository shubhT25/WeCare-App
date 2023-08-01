const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/errorHandler.js");
const sendEmail = require("../utils/sendEmail.js");
const signInToken = require("../utils/signInToken.js");
const crypto = require("crypto");

//getAllUsers --admin
exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

//registerUser
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const {
    UserId,
    Name,
    Password,
    Gender,
    DateOfBirth,
    Email,
    MobileNumber,
    PinCode,
    City,
    State,
    Country,
  } = req.body;

  const user = await User.create({
    UserId,
    Name,
    Password,
    Gender,
    DateOfBirth,
    Email,
    MobileNumber,
    PinCode,
    City,
    State,
    Country,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Get User Details
exports.getMyDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  console.log(req.user);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.user.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//update Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const new_user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    new_user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+Password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.Password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// Delete User
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
    deletedUser,
  });
});

//login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { UserId, Password } = req.body;

  if (!UserId || !Password) {
    return next(new ErrorHandler("Please Enter UserID & Password", 400));
  }

  const user = await User.findOne({ UserId }).select("+Password");

  if (!user) {
    return next(new ErrorHandler("Invalid UserId or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(Password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid UserId or Password", 401));
  }

  signInToken(user, 200, res);
});

//logout User
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
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
  const user = await User.findOne({ Email: req.body.Email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.Email,
      subject: `WeCare Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.Email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

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

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
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

  user.Password = req.body.Password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  signInToken(user, 200, res);
});
