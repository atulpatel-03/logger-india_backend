const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Brand = require("../models/brandModel");
const cloudinary = require("cloudinary");

exports.createBrand = catchAsyncErrors( async (req,res,next) =>{

    const { name, image } = req.body;

    const alreadyBrand = await Brand.findOne({name:name});

    if(alreadyBrand){
        return next(new ErrorHander("Brand Already Exist", 409));
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
    
 
    let newBrand = capitalizeFirstLetter(name);

    
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: "brands",
    });

    const newBrandd = await Brand.create({
        name:newBrand,
        images:{
          public_id: result.public_id,
          url: result.secure_url,
        }
    });

    res.status(201).json({
        success: true,
        newBrandd,
      });

});

exports.getAllBrand = catchAsyncErrors( async (req,res,next) =>{
    const allBrand = await Brand.find().sort({createdAt: -1});

    res.status(200).json({
        success: true,
        allBrand,
      });
})


exports.removeBrand = catchAsyncErrors( async (req,res,next) =>{
    const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorHander("Brand not found with this Id", 404));
  }

  await brand.remove();

  res.status(200).json({
    success: true,
  });
})
