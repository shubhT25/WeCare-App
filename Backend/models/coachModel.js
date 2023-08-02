const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");

const coachSchema = new mongoose.Schema({
  CoachId: {
    type: String,
    unique: true,
    required: true,
  },

  Name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    unique: [true, "Coach with this name already exists"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },

  Password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    select: false,
    validate: {
      validator: pwdValidate,
      message:
        "The password should be minimum 8 characters long with atleast one upper, one lower case character and one number",
    },
  },

  Gender: {
    type: String,
    required: [true, "Please Enter Your Gender"],
    enum: ["M", "F"],
  },

  DateOfBirth: {
    type: Date,
    required: [true, "Please Enter Your Date of Birth"],
    validate: {
      validator: ageValidate,
      message: "Age should be above 18 and below 100 years",
    },
  },

  Email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: [true, "User with Email Id already exists"],
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },

  MobileNumber: {
    type: Number,
    required: [true, "Please Enter Your Mobile Number"],
    validate: {
      validator: MNValidate,
      message: "Mobile Number must be 10 digits long",
    },
  },

  Speciality: {
    type: String,
    required: [true, "Please Enter Your Speciality"],
    maxLength: [40, "Speciality cannot exceed 40 characters"],
    minLength: [5, "Speciality should have more than 5 characters"],
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

function pwdValidate(value) {
  const pwdRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const pwdValidationResult = pwdRegex.test(value);
  if (!pwdValidationResult) {
    return false;
  }
  return true;
}

function ageValidate(value) {
  const today = new Date();
  const DateOfBirth = new Date(value);
  var age = today.getYear() - DateOfBirth.getYear();
  const m = today.getMonth() - DateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < DateOfBirth.getDate())) {
    age--;
  }
  if (age < 18 || age > 100) {
    return false;
  }
  return true;
}

function MNValidate(value) {
  const MNRegex = /^[1-9][0-9]{9}$/;
  const MNValidationResult = MNRegex.test(value.toString());
  if (!MNValidationResult) {
    return false;
  }
  return true;
}

coachSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    next();
  }
  this.Password = await bcrypt.hash(this.Password, 10);
});

coachSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

coachSchema.methods.comparePassword = async function (Password) {
  if(!Password) {
    return false
  }
  return await bcrypt.compare(Password, this.Password);
};

// Generating Password Reset Token
coachSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Coach", coachSchema);
