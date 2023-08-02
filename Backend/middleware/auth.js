const ErrorHander = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Coach = require("../models/coachModel")

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
  
    if (!token) {
      return next(new ErrorHander("Please Login to access this resource", 401));
    }
  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("DD", decodedData)

    req.user = await User.findById(decodedData.id);
  
    next();
});

exports.isAuthenticatedCoach = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  
  console.log("DD", decodedData)

  req.coach = await Coach.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (role) => {
  return (req, res, next) => {
    if (role !== "admin") {
      return next(
        new ErrorHander(
          `Role: ${role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};

