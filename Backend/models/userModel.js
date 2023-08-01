const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  UserId: {
    type: String,
    unique: true,
    required: true,
  },

  Name: {
    type: String,
    required: [true, "Please Enter Your Name"],
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
      message: "Age should be above 18 and below 100 years"
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
      message: "Mobile Number must be 10 digits long"
    },
  },

  PinCode: {
    type: Number,
    required: [true, "Please Enter Your PinCode"],
    validate: {
      validator: pinValidate,
      message: "Pincode must be 6 digits long"
    },
  },

  City: {
    type: String,
    required: [true, "Please Enter Your City"],
    maxLength: [20, "Name cannot exceed 20 characters"],
    minLength: [3, "Name should have more than 3 characters"],
  },

  State: {
    type: String,
    required: [true, "Please Enter Your State"],
    maxLength: [20, "Name cannot exceed 20 characters"],
    minLength: [3, "Name should have more than 3 characters"],
  },

  Country: {
    type: String,
    required: [true, "Please Enter Your Country"],
    maxLength: [20, "Name cannot exceed 20 characters"],
    minLength: [3, "Name should have more than 3 characters"],
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

function pwdValidate() {
  const pwdRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const pwdValidationResult = pwdRegex.test(this.Password);
  if (!pwdValidationResult) {
    return false;
  }
  return true;
}

function ageValidate() {
  const today = new Date();
  const DateOfBirth = new Date(this.DateOfBirth);
  var age = today.getYear() - DateOfBirth.getYear();
  const m = today.getMonth() - DateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < DateOfBirth.getDate())) {
    age--;
  }
  if (age < 18 || age > 100) {
    return false
  }
  return true
}

function MNValidate() {
  const MNRegex = /^[1-9][0-9]{9}$/;
    const MNValidationResult = MNRegex.test(this.MobileNumber.toString());
    if (!MNValidationResult) {
      return false
  }
  return true
}

function pinValidate() {
  const pinRegex = /^[1-9][0-9]{5}$/;
    const pinValidationResult = pinRegex.test(this.PinCode.toString());
    if (!pinValidationResult) {
      return false
  }
  return true
}


userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    next();
  }
  this.Password = await bcrypt.hash(this.Password, 10);
});

userSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
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


module.exports = mongoose.model("User", userSchema);
