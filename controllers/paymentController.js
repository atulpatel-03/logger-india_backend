const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const Razorpay = require("razorpay")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const uniqId = require("uniqid")
const crypto = require("crypto")

console.log("sdfakdsfsakld", process.env.RAZORPAY_ID_KEY)

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_ID_SECRET,
})

exports.razorPayPayment = catchAsyncErrors(async (req, res, next) => {
  const razPayment = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: uniqId(),
  })
  res.status(200).json({ success: true, order: razPayment })
})

exports.sendRozarPayApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ razorPayApiKey: process.env.RAZORPAY_ID_KEY })
})

exports.razorPayVerify = catchAsyncErrors(async (req, res, next) => {
  const order_id = req.body.order_id
  const razorpay_payment_id = req.body.razorpay_payment_id
  const razorpay_signature = req.body.razorpay_signature

  let tempBody = order_id + "|" + razorpay_payment_id
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_ID_SECRET)
    .update(tempBody.toString())
    .digest("hex")

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: "Transaction not legit!" })
  }

  res.status(200).json({
    success: true,
    captured: true,
    paymentId: razorpay_payment_id,
    order_id: order_id,
  })
})
