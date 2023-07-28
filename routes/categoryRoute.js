const express = require("express");
const {
    getAllCAtegory,
    createCategory, 
    removeCategory
} = require("../controllers/categoryController");

const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/getallcategory").get(getAllCAtegory);

router.route("/admin/createcategory").post(isAuthenticatedUser, authorizeRoles("admin"),createCategory);

router.route("/admin/deletecategory/:id").delete(isAuthenticatedUser, authorizeRoles("admin"),removeCategory);

module.exports = router;