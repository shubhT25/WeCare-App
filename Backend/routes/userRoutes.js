const express = require('express');
const { getAllUsers, registerUser, getUserDetails, updateProfile, deleteUser, loginUser, logoutUser, getMyDetails, forgotPassword, resetPassword, updatePassword } = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();


router.route("/user/register").post(registerUser)
router.route("/users").get(getAllUsers)

router.route("/user/login").post(loginUser);
router.route("/user/logout").get(logoutUser);
router.route("/user/me").get(isAuthenticatedUser, getMyDetails)

router.route("/user/:id")
    .get(isAuthenticatedUser, getUserDetails)
    .put(isAuthenticatedUser, updateProfile)
    .delete(isAuthenticatedUser, deleteUser)

router.route("/user/update/password").put(isAuthenticatedUser, updatePassword)

router.route("/user/password/forgot").post(forgotPassword);
router.route("/user/password/reset/:token").put(resetPassword);

module.exports = router
