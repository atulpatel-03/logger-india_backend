const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/categoryModel");


exports.createCategory = catchAsyncErrors( async (req,res,next) =>{

    const { name } = req.body;
console.log("asda",name);
    const alreadyCategory = await Category.findOne({name:name});

    if(alreadyCategory){
        return next(new ErrorHander("Category Already Exist", 409));
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    let newCategory = capitalizeFirstLetter(name);
    const newCategoryy = await Category.create({
        name:newCategory
    });

    res.status(201).json({
        success: true,
        newCategoryy,
      });

});

exports.getAllCAtegory = catchAsyncErrors( async (req,res,next) =>{
    const allCategory = await Category.find().sort({createdAt: -1});

    res.status(200).json({
        success: true,
        allCategory,
      });
})


exports.removeCategory = catchAsyncErrors( async (req,res,next) =>{
    const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHander("Category not found with this Id", 404));
  }

  await category.remove(); 

  res.status(200).json({
    success: true,
  });
})
