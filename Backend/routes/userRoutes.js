const express = require('express');
const { getAllUsers, registerUser, getUserDetails, updateProfile, deleteUser, loginUser, logoutUser, getMyDetails, forgotPassword, resetPassword, updatePassword } = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();


router.route("/user/register").post(registerUser)
router.route("/users").get(getAllUsers)
router.route("/users/:id")
    .get(isAuthenticatedUser, getUserDetails)
    .put(isAuthenticatedUser, updateProfile)
    .delete(isAuthenticatedUser, deleteUser)

router.route("/user/update/password").put(isAuthenticatedUser, updatePassword)

router.route("/user/login").post(loginUser);
router.route("/user/logout").get(logoutUser);
router.route("/me").get(isAuthenticatedUser, getMyDetails)

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router
