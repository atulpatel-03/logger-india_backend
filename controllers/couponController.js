const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Coupon = require("../models/couponModel");


exports.generateCoupon = catchAsyncErrors( async (req,res,next) =>{

    const { couponCode, percent, uptoAmount } = req.body;

    const alreadyCoupon = await Coupon.findOne({code:couponCode});

    if(alreadyCoupon){
        return next(new ErrorHander("Coupon Already Exist", 409));
    }
    let newCouponCode = couponCode.toUpperCase();
    const newCoupon = await Coupon.create({
        code:newCouponCode,
        percent,
        uptoAmount,
        isActive:true
    });

    res.status(201).json({
        success: true,
        newCoupon,
      });

});

exports.getAllCoupon = catchAsyncErrors( async (req,res,next) =>{
    const allCoupon = await Coupon.find().sort({createdAt: -1});

    res.status(200).json({
        success: true,
        allCoupon,
      });
})


exports.removeCoupon = catchAsyncErrors( async (req,res,next) =>{
    const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorHander("Coupon not found with this Id", 404));
  }

  await coupon.remove();

  res.status(200).json({
    success: true,
  });
})
