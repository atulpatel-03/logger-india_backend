const express = require("express");
const {
  razorPayPayment,
  sendRozarPayApiKey,
  razorPayVerify
} = require("../controllers/paymentController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticatedUser, razorPayPayment);
router.route("/payment/verify").post(isAuthenticatedUser, razorPayVerify);
router.route("/razorpayapikey").get(isAuthenticatedUser, sendRozarPayApiKey);

module.exports = router;
