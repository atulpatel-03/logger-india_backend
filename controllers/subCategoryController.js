const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Subcategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModel");

exports.createSubCategory = catchAsyncErrors( async (req,res,next) =>{

    const { name } = req.body;
    const alreadyCategory = await Subcategory.findOne({name:name});
    const category = await Category.findById(req.params.id);
    if(alreadyCategory){
        return next(new ErrorHander("Sub Category Already Exist", 409));
    }

    function capitalizeFirstLetters(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    let newSubCategory = capitalizeFirstLetters(name);
    const newSubCategoryy = await Subcategory.create({
        name:newSubCategory,
        category:category
    });

    res.status(201).json({
        success: true,
        newSubCategoryy,
      });

});

exports.getAllSubCAtegory = catchAsyncErrors( async (req,res,next) =>{
    const allSubCategory = await Subcategory.find({category:req.params.id}).sort({createdAt: -1});

    res.status(200).json({
        success: true,
        allSubCategory,
      });
})


exports.removeSubCategory = catchAsyncErrors( async (req,res,next) =>{
    const category = await Subcategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorHander("Sub Category not found with this Id", 404));
  }

  await category.remove(); 

  res.status(200).json({
    success: true,
  });
})
