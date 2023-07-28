const express = require("express");
const {
    getAllSubCAtegory,
    createSubCategory, 
    removeSubCategory
} = require("../controllers/subCategoryController");

const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/getallsubcategory/:id").get(getAllSubCAtegory);

router.route("/admin/createsubcategory/:id").post(isAuthenticatedUser, authorizeRoles("admin"),createSubCategory);

router.route("/admin/deletesubcategory/:id").delete(isAuthenticatedUser, authorizeRoles("admin"),removeSubCategory);

module.exports = router;