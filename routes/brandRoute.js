const express = require("express");
const {
    getAllBrand,
    createBrand, 
    removeBrand
} = require("../controllers/brandController");

const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/getallbrand").get(getAllBrand);

router.route("/admin/createbrand").post(isAuthenticatedUser, authorizeRoles("admin"),createBrand);

router.route("/admin/deletebrand/:id").delete(isAuthenticatedUser, authorizeRoles("admin"),removeBrand);

module.exports = router;