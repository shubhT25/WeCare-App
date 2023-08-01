const express = require('express');
const { getAllCoachs, registerCoach, getCoachDetails, updateProfile, deleteCoach, loginCoach, logoutCoach, getMyDetails, forgotPassword, resetPassword, updatePassword } = require('../controllers/CoachController');
const { isAuthenticatedCoach } = require('../middleware/auth');

const router = express.Router();

router.route("/coach/register").post(registerCoach)
router.route("/coachs").get(getAllCoachs)
router.route("/coachs/:id")
    .get(isAuthenticatedCoach, getCoachDetails)
    .put(isAuthenticatedCoach, updateProfile)
    .delete(isAuthenticatedCoach, deleteCoach)

router.route("/coach/update/password").put(isAuthenticatedCoach, updatePassword)

router.route("/coach/login").post(loginCoach);
router.route("/coach/logout").get(logoutCoach);
router.route("/me").get(isAuthenticatedCoach, getMyDetails)

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router
