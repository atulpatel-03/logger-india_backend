const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: [true, "Please Enter Your Coupon Code"],
        unique: true,
        maxLength: [10, "Coupon code cannot exceed 10 characters"],
        minLength: [4, "Coupon code should have more than 4 characters"],
       
    },
    percent: {
         type: Number, 
         required: true, 
    },
    uptoAmount: { 
        type: Number, 
        required: true 
    },
    isActive: {
         type: Boolean, 
         required: true, 
         default: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});

module.exports = mongoose.model("Coupon", couponSchema);