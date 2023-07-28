const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendEmail = require("../utils/sendEmail");
const pdfOption = require("../utils/pdfOptions");
const pdf = require('pdf-creator-node');
const path = require('path');
const msg91 = require('msg91-send-sms');
const moment = require('moment');
const http = require("https");
const fs = require("fs");
// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    billingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
    couponPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    billingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice, 
    couponCode,
    couponPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  const order_url = `${req.protocol}://${req.get(
    "host"
  )}/order/${order.id}`;

  const admin_url = `${req.protocol}://${req.get(
    "host"
  )}/admin/order/${order.id}`;
  console.log("admin site ",order_url,req.protocol);
  // const order_url = `${process.env.FRONTEND_URL}/order/${order.id}`
  const message = `Your have order this product from Logger India :- \n\n ${order_url} \n\n Thankyou for ordering with us`;
  // const admin_url = `${process.env.FRONTEND_URL}/admin/order/${order.id}`;
  const message2 = `New Order is Recieved with order id : ${order.id} \n\n ${admin_url}`;
  
  // await sendEmail({
  //   email: req.user.email,
  //   subject: `Order the item from Logger India`,
  //   message,
  // });

  // await sendEmail({
  //   email: process.env.SMPT_MAIL,
  //   subject: `New Order Recieved`,
  //   message:message2,
  // });

  const obj = {
    auth_key: process.env.MSG91_AUTH_KEY,
    "path": "/api/v5/flow/",
    mobiles: '918085371494',
    message: 'Testing msg',
    sender: process.env.MSG91_SENDER_ID, 
    route: '4', 
    response: 'json', 
};
 
//send sms
// new Promise((resolve, reject) => {
//   msg91(obj)
//   .then(res => {
//       if(res.type == 'error'){
//           console.log('error: ', res);
//           //return;
//           resolve(false);
//       } else {
//           console.log('success: ',res);
//           console.log("subbfsdkjfksdbjfksbdfkasbdfkasjbdfkj")
//           resolve(true);
//       }
//   })
//   .catch(err => {
//       console.log('error: ', err);
//       reject(err);
//   });
// });
    
  console.log("Email send successfull")

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({createdAt: -1});

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().sort({createdAt: -1});

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });

    const userOrder = await User.findById(order.user);

    const order_url = `${req.protocol}://${req.get(
    "host"
  )}/order/${order.id}`;

  // const order_url = `${process.env.FRONTEND_URL}/order/${order.id}`
  const message = `Your order from Logger India Has successfully shipped :- \n\n ${order_url} \n\n Thankyou for ordering with us`;
  
  await sendEmail({
    email:userOrder.email,
    subject: `Order the item from Logger India has been shipped`,
    message,
  });

  console.log("Email send successfull")
  }


  order.orderStatus = req.body.status;


  if (req.body.status === "Delivered") {

    order.deliveredAt = Date.now();
    console.log("my orders",order);
    const userOrder = await User.findById(order.user);
    const html = fs.readFileSync(path.join(__dirname, '../pdfTemplate/template.html'), 'utf-8');
    let serial=1;
    var allProduct = [];
    order.orderItems.forEach((o) => {
      allProduct.push({
        'serial':serial,
        'name':o.name,
        'price':o.price,
        'quantity':o.quantity,
        'amount':o.quantity * o.price + (o.quantity * o.price * 18)/100,
        'gst':(o.quantity * o.price * 18)/100,
      })
      serial++;
    });

    let subtotal = 0;
    let subtotalTax =0;
    let totalQuantity = 0;
    allProduct.forEach(i =>{
      subtotal += (i.price * i.quantity);
      subtotalTax += i.amount;
      totalQuantity += i.quantity;
    })
    let grandtotal = (Math.round(order.totalPrice * 100) / 100).toFixed(2);
    let taxPrice = (Math.round(order.taxPrice * 100) / 100).toFixed(2);
    let cgst =0;
    let sgst =0;
    let igst =0;

    if(order.shippingInfo.state == 'RJ'){
      cgst = taxPrice /2;
      sgst = taxPrice /2;
    }
    else{
     igst = taxPrice;
    }

    const getRandomId = (min = 1000, max = 500000) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const num =  Math.floor(Math.random() * (max - min + 1)) + min;
      return num;
    };

    const invoiceNo = getRandomId();
    let invoiceDate = moment(order.paidAt).format("DD-MM-YYYY");
    let obj = {
      prodlist: allProduct,
      subtotal: subtotal,
      subtotalTax:subtotalTax,
      gtotal:grandtotal,
      totalQuantity:totalQuantity,
      shippingcost:order.shippingPrice,
      cgst:cgst,
      igst:igst,
      sgst:sgst,
      shippingDetail:order.shippingInfo,
      billingDetail:order.billingInfo,
      customerName:userOrder.name,
      date:invoiceDate,
      invoiceNo:invoiceNo,
      discountAmount:order.couponPrice,
    }

    const document = {
      html:html,
      data:{
        products: obj
      },
     type:"buffer"
    }

  
    const result = await pdf.create(document, pdfOption)
    const invoicePdf=result.toString('base64');
   console.log("pdf result",result);
   
   
  
     const order_url = `${req.protocol}://${req.get(
    "host"
  )}/order/${order.id}`;

  
  // const order_url = `${process.env.FRONTEND_URL}/order/${order.id}`
  const message = `Your order from Logger India Has successfully Delivered :- \n\n ${order_url} \n\n Thankyou for ordering with us`;
  
  await sendEmail({
    email: userOrder.email,
    subject: `Your Order from Logger India is Successfully delivered`,
    message,
    attachments:[{
      filename: 'invoice.pdf',
      content:invoicePdf,
      encoding: 'base64',
    }]
  });
  console.log("Email send successfull")
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// update Order Tracking Id -- Admin
exports.updateOrderTrack = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  const userOrder = await User.findById(order.user);

  order.trackingId = req.body.trackingId;

   const order_url = `${req.protocol}://${req.get(
    "host"
  )}/order/${order.id}`;

  
  // const order_url = `${process.env.FRONTEND_URL}/order/${order.id}`
  const message = `Your order from Logger India Has Been Processed, You can Track your Order By Clicking on this link :- \n\n ${order_url} \n\n Thankyou for ordering with us`;
  
  await sendEmail({
    email: userOrder.email,
    subject: `Track Your Order`,
    message,
  });
  console.log("Email send successfull")


  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });


});

// delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
