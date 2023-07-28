const express = require("express");
const {
    generateCoupon, 
    getAllCoupon,
    removeCoupon,
} = require("../controllers/couponController");

const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/getallcoupons").get(isAuthenticatedUser,getAllCoupon);

router.route("/admin/generatecoupon").post(isAuthenticatedUser, authorizeRoles("admin"),generateCoupon);

router.route("/admin/deletecoupon/:id").delete(isAuthenticatedUser, authorizeRoles("admin"),removeCoupon);

module.exports = router;