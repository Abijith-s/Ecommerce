var express = require("express");
var router = express.Router();
var userHelper = require("../helpers/userHelpers");
const productHelpers = require("../helpers/productHelpers");

var uuid = require('uuid')
// const accountSid = "VA85af1ab7b9fde580ab2f2523f7f18528";
const accountSid = "AC12c290f739cdf6b335503bcd652ae883";
const serviceID = "VA85af1ab7b9fde580ab2f2523f7f18528";
const authToken = "a5bbb367a4138c9d3291ef99a3bdc612";
const twilio = require("twilio")(accountSid, authToken);
const CLIENT_ID="271754934598-r9gag7rfcoka093scca7jgj9ds41vtr4.apps.googleusercontent.com";
const {OAuth2Client} = require('google-auth-library');
const { compareSync } = require("bcrypt");
const client=new OAuth2Client(CLIENT_ID)
const paypal = require('paypal-rest-sdk');
const userHelpers = require("../helpers/userHelpers");
const { response } = require("express");
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AT2s8bbysSakxAt97VYk2oPBD5dhnVgp99RS3DCgbT6cLdeL1nFyzeFJQSTLthRn_-OjUXI7JQH5epS2',
  'client_secret': 'EJUKJM89uOc94DuptruEIUFQKNvSk68nkrh3LC5lZHRExodUGJEjOcPW44ZoxVTacF0M6xkCUC2-2UYi'
});
// const sendSms = (phone, message) => {
//   const client = require('twilio')(accountSid, authToken);
//   client.messages
//     .create({
//        body: message,
//        to: `+91${phone}`,
//        channel:"sms"
//      })
//     .then(message => console.log(message.sid))
//     .catch((err)=>console.log(err));
// }

const checkUserCartLength = async (req, res, next) => {
  let user = req.session.user || false;
  let cartCount = 0;
  if (user) {
    cartCount = await productHelpers.getCartProducts(user._id);
    cartCount = cartCount.length;
  }
  req.session.cartCount = cartCount;
  next();
};
const checkUserWishlistLength = async (req, res, next) => {
  let user = req.session.user || false;
  let wishlistCount = 0;
  if (user) {
    wishlistCount = await productHelpers.getWishlistProducts(user._id);
    wishlistCount = wishlistCount.length;
    
  }
  req.session.wishlistCount = wishlistCount;
  next();
};
function verifyLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}
/* GET home page. */
router.get("/",async function (req, res, next) {
  let user = req.session.user;
  let cate = req.query.cate;
  let subcat = req.query.subcat
  let cat = req.query.cat
  let search = req.query.productname
  console.log("cate-----------------------")
 
  let cartCount;
  let products
  productHelpers.offerExpiration()
  if (req.session.user) {
    cartCount = await productHelpers.getCartCount(req.session.user._id);
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  } else {
    cartCount = null;
    wishlistCount = null;
  }
  let nonecat =true
  let subcatg = false
if(cate){
  
   products = await productHelpers.getCategory(cate);
  
   nonecat=false
 
}else if(subcat){
  nonecat =false
 products =await productHelpers.getSubCategoryProducts(subcat,cat)
 
subcatg =true

}else if(search){
  products =  await productHelpers.searchProducts(req.query.productname)

}
else{
  products = await productHelpers.getAllProducts()
}


  let categories = await productHelpers.getAllCategories();
    res.render("users/landing", {
      admin: false,
      products,
      user,
      cartCount,
      categories,
      nonecat,subcatg
    });

});


router.post('/googlelogin',async(req,res)=>{
  
  let token = req.body.token
  console.log(token);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  console.log(payload);
let user = await userHelper.getUserBymail(payload.email)
if(user){
 
  
    req.session.user = user
    req.session.loggedIn = true
    res.json({status:true})

  
}else{
  
const createdUser = await userHelpers.addGoogleUser(payload.email, payload.given_name)
console.log('createdUser:', createdUser);
req.session.user = createdUser
req.session.loggedIn = true
req.session.user_id = createdUser._id
res.json({status:true})
}
  } catch (error) {
    
  }
      
   
  
  })



router.get("/signup",async (req, res) => {
  let user = req.session.user;
  let categories = await productHelpers.getAllCategories()
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("users/signup", { admin: false, user,categories });
  }
});
router.post("/signup",async (req, res) => {
 
   userHelper.findSignUpUser(req.body.phone).then((result)=>{
     if(result==false){
       res.json({status:false})
     }else {
       req.session.signInUser = req.body
       let otp = req.body.phone;
       console.log("evde aada otp")
       console.log(otp)
       twilio.verify
         .services(serviceID)
         .verifications.create({
           to: `+91${otp}`,
           channel: "sms",
           message: "otp",
         })
         .then((response) => {
           console.log("*********************")
           console.log(response)
           if (response.status == "pending") {
             res.json({ status: true });
           }
         }).catch((err)=>{
          console.log("*********************")
           console.log(err)
         });
     
     }
   })
  
    
  
});

router.get('/enter-otp',async(req,res)=>{
  console.log("otp aato")
  let categories = await productHelpers.getAllCategories()
  
  let user = req.session.user;
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("users/enter-otp", { admin: false, user,categories });
  }
})

router.post('/enter-otp',(req,res)=>{
  let userSignIn = req.session.signInUser;
  
  let otp = req.body.otp;
  let number = userSignIn.phone;
  twilio.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    }) .then((response) => {
     
      if(response.status == "approved" && response.valid) {
         userHelper.addUsers(userSignIn).then((user)=>{
           delete req.session.signInUser
           if(user){
            req.session.user = user;
            req.session.SignIn = true;
            console.log("userin entry kofuthu")
            res.json({status:true})
           }
            
         })
        
      }else{
        res.json({status:false})
      }
    })
  
  
})

router.post('/resend-otp',(req,res)=>{
 let userSignIn = req.session.signInUser 
  let otp = userSignIn.phone;
  twilio.verify
    .services(serviceID)
    .verifications.create({
      to: `+91${otp}`,
      channel: "sms",
      message: "otp",
    })
    .then((response) => {
      if (response.status == "pending") {
        res.json({ status: true });
      }
    });
})
router.get("/login",async (req, res) => {
   
  let id = req.query.cate;
  let categories = await productHelpers.getAllCategories()
  
  if (req.session.loggedIn && req.session.user) {
     
    res.redirect("/");
  } else {
    errMsg = req.session.loggedInErr
    req.session.loggedInErr=""
    res.render("users/login",{ admin: false, user: false ,loginErr:errMsg,blockedUser:req.session.blocked,categories});
    
  }
});
router.post("/login", (req, res) => {

  let proId = req.session.addCart
  userHelper.doLogin(req.body).then((response) => {
   
    if (response.status && response.user.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;
      if(req.session.addCart){
        console.log("******************proId")
        res.redirect(`/add-to-cart/${proId}`)
      }else{
        res.redirect("/");
      }
    }else {
     
      req.session.loggedInErr =true
      res.redirect("/login");
    }
    if(response.user.status==null){
      
      req.session.blocked = true
      res.redirect('/login')
    }
  });
});
router.get("/logout", (req, res) => {
  delete req.session.user;
  res.redirect("/");
});

router.get("/product-view", checkUserCartLength,async(req, res) => {
  let proId = req.query.id;
  console.log("proId")
  console.log(proId)
  let categories = await productHelpers.getAllCategories()

  let user = req.session.user || false;
  let cartCount = req.session.cartCount;
  let  wishlistCount = 0
  if(req.session.user){
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  }else{
    wishlistCount = null;
  }
  productHelpers.productView(proId).then((product) => {
    console.log("........................................")
    console.log(product)
    res.render("users/product-view", {
      admin: false,
      user,
      product,
      cartCount,
      wishlistCount,
      categories
    });
  });
});
router.get("/cart", checkUserCartLength, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = req.session.cartCount;
  console.log("njn kerumbo thanne varum")
  console.log(req.session.user.offerAmount)
  let categories = await productHelpers.getAllCategories()

  let total = await productHelpers.getTotalAmount(userId);
  console.log(total)
  let subtotalA
  let totalAmount = 0
  for(var i in total){
    totalAmount=totalAmount+total[i].subtotal
  }
  let  wishlistCount = 0
   if(req.session.user){
     wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
   }else{
     wishlistCount = null;
   }
  
  console.log(subtotalA)
  await productHelpers.getCartProducts(userId).then((products) => {
    console.log("ppppppppppppppppp")
    console.log(products)
    res.render("users/cart", {
      admin: false,
      user,
      cartCount,
      products,
      totalAmount,
      total,
      wishlistCount,
      categories
    });
  });
});
 
// this is orginal router
router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  
  let proId = req.params.id;
  let userId = req.session.user._id;
  
  if(req.session.user){
    productHelpers.addToCart(proId, userId).then((response) => {
      if(req.session.addCart){
        delete req.session.addCart
        res.redirect("/cart")
       
      }else{
        res.json({ status: true });
      }
    
    });
  }else{
   res.json({status:false})
  }

});


// this is for guset user
router.get("/add-cart/:id",(req, res) => {
  let proId = req.params.id;
   if(req.session.user){
    res.json({status:true,proId})
  }else{
    console.log("session updated with pro id")
    req.session.addCart = proId
    res.json({status:false,proId})
  }
  
  
  // if(req.session.user){
  //   productHelpers.addToCart(proId, userId).then((response) => {
  //     res.json({ status: true });
  //   });
  // }else{
  // res.json({status:false})
  // }

});

router.post("/change-quantity",async(req,res) => {
  console.log("ivde ethyo")
  userId = req.session.user._id
  let subtotal =await  productHelpers.getSubTotal(userId)
  subtotal = subtotal[0].subtotal
  console.log(subtotal)
  productHelpers.changeQuantity(req.body).then((response) => {
    console.log(" response")
    console.log(response)

    res.json({ status:true ,subtotal});
  });
});

router.post("/delete-cart-item", (req, res) => {

  productHelpers.deleteCartItem(req.body).then((response) => {
    res.json({ status: true });
  });
});



// checkout page start
router.get("/checkout", verifyLogin, checkUserCartLength,async (req, res) => {
  let categories = await productHelpers.getAllCategories()
  
  let proId = req.query.proId
  let  singleProductPrice
  let  wishlistCount = 0
   if(req.session.user){
     wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
   }else{
     wishlistCount = null;
   }
  console.log("+-+-+-+++-+++-+-+-+--+-+-+-+-+-+-++-+-+-+--+")
  if(proId){
    let buyNowproduct =await productHelpers.findedProduct(proId)
    if( buyNowproduct.offerprice){
      singleProductPrice = buyNowproduct.offerprice
    }else{
      singleProductPrice = buyNowproduct.price
    }
    
    req.session.buynow = buyNowproduct._id
  }
  let user = req.session.user;
  userId = req.session.user._id
  console.log("userID")
  console.log(userId)
  let cartCount = req.session.cartCount;
  
  let addresses =await productHelpers.getAddressId(userId) 
  let total = await productHelpers.getTotalAmount(userId);

 
  let totalAmount = 0
  console.log(total)
  let subtotalA
  
  
  
  for(var i in total){
    totalAmount=totalAmount+total[i].subtotal
  }
  let productPrice
  if(proId){
    productPrice = singleProductPrice
  }else{
    productPrice = totalAmount
  }
  console.log("=-=-=-=-=-=-=-=-==-=-=-=-=-==-=-=--=--=-==-==-=")
  console.log(productPrice)
  res.render("users/checkout", { admin: false, user, cartCount ,addresses,productPrice,wishlistCount,categories});
});
// check out page end


router.post("/place-order", async (req, res) => {
  console.log("req body");
  console.log(req.body);
  console.log(req.body.payment)
  let user = req.session.user
  console.log(user)
  let userId = req.session.user._id
  console.log(userId)
  
  let flag = 0
  let PaymentMethod = req.body.payment
  if(req.body.saveAddres){
    console.log("ivde keritond")
    var addressId = uuid.v4()
    productHelpers.addAddress(req.body,userId,addressId)
  }
  if(req.body.payment == 'COD'){
    let products
    let buyNowProducts
    let buyNow = req.session.buynow
    let productPrice
    if(buyNow){
     flag = 1
     products =await productHelpers.getBuyNowProduct(buyNow)
      if(products[0].offerprice){
        productPrice = products[0].offerprice
      }else{
        productPrice = products[0].price
      }
      
     
     products = {
      products
    }
     
    }else{
      products=await productHelpers.getProductList(userId)
    }
   
     
    let total = await productHelpers.getTotalAmount(userId);
    console.log("ithanu products ++++++++++++++++++++++++++++++++++++++")
    console.log(products)
  
  console.log(total)
  let subtotalA
  let totalAmount = 0
  
  if(req.session.offerDetails){
   let offerPrice = req.session.offerDetails.offerAmount
   totalAmount = offerPrice
   console.log(totalAmount)
  }else{
    for(var i in total){
      totalAmount=totalAmount+total[i].subtotal
    }
  }
 
    console.log("total and producst ")
    console.log(totalAmount)
    let totalPrice 
    if(buyNow){
      totalPrice = productPrice
    }else{
      totalPrice = totalAmount
    }
    productHelpers.placeOrder(req.body,products,totalPrice,PaymentMethod,userId,flag).then((result)=>{
      if(req.session.offerDetails){
      let offerPrice = req.session.offerDetails
      let couponId = offerPrice.couponCode
      userHelper.markCoupon(userId,couponId)
     
      delete req.session.offerDetails
      res.json({status:result})
    }else{
      res.json({status:result})
    }
    })
  }else if(req.body.payment=='Razorpay'){
    console.log("ee casil varanondo")
    let products
    let buyNowProducts
    let buyNow = req.session.buynow
    let productPrice
    let totalPrice 
    let totalAmount = 0
    if(buyNow){
      flag = 1
     products =await productHelpers.getBuyNowProduct(buyNow)
     if(products[0].offerprice){
      productPrice = products[0].offerprice
    }else{
      productPrice = products[0].price
    }
     
     products = {
      products
    }
     console.log("//////////////////////////")
     console.log(products)
    }else{
      products=await productHelpers.getProductList(userId)
      console.log("--------------------------------")
      console.log(products)
    }
  
    let total = await productHelpers.getTotalAmount(userId);
    
    console.log(total)

    if(req.session.offerDetails){
      let offerPrice = req.session.offerDetails.offerAmount
      totalAmount = offerPrice
      console.log(totalAmount)
     }else{
       for(var i in total){
         totalAmount=totalAmount+total[i].subtotal
       }
     }
     if(buyNow){
      totalPrice = productPrice
    }else{
      totalPrice = totalAmount
    }

    productHelpers.placeOrder(req.body,products,totalPrice,PaymentMethod,userId,flag).then((result)=>{
      if(req.session.offerDetails){
        let offerPrice = req.session.offerDetails
        let couponId = offerPrice.couponCode
        userHelper.markCoupon(userId,couponId)
        delete req.session.offerDetails
      }

      let orderId = result._id
      console.log("orderId ")
      console.log(orderId)

      productHelpers.generateRazorPay(orderId,totalPrice).then((response)=>{
        
        console.log("response of razor pay")
        console.log(response)
        res.json({response,data:response,user:user})
      })
    })
    
  }else if(req.body.payment=='Paypal'){
    console.log("ivde keranodo 6666666666666666666666666666666666666")
    let products
    let buyNowProducts
    let buyNow = req.session.buynow
    let productPrice
    let totalPrice 
    if(buyNow){
      flag = 1
     products =await productHelpers.getBuyNowProduct(buyNow)
     if(products[0].offerprice){
      productPrice = products[0].offerprice
    }else{
      productPrice = products[0].price
    }
     
     products = {
      products
    }
     console.log("//////////////////////////")
     console.log(products)
    }else{
      products=await productHelpers.getProductList(userId)
      console.log("--------------------------------")
      console.log(products)
    }
       
      let total = await productHelpers.getTotalAmount(userId);
 
      console.log(total)
      
      let totalAmount = 0
      
      
      if(req.session.offerDetails){
        let offerPrice = req.session.offerDetails.offerAmount
        totalAmount = offerPrice
        console.log(totalAmount)
       }else{
         for(var i in total){
           totalAmount=totalAmount+total[i].subtotal
         }
       }
     totalAmount = (totalAmount)/70
    totalAmount=Math.round(totalAmount)
    console.log(totalAmount)
    
    if(buyNow){
      totalPrice = Math.round(productPrice/70)
    }else{
      totalPrice = Math.round(totalAmount)
    }
    console.log("+++++++++++++++++++++++++++++++++++++++")
    console.log(totalPrice)
    productHelpers.placeOrder(req.body,products,totalPrice,PaymentMethod,userId,flag)
    if(req.session.offerDetails){
      let offerPrice = req.session.offerDetails
      let couponId = offerPrice.couponCode
      userHelper.markCoupon(userId,couponId)
     
      delete req.session.offerDetails
    }
    
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:4000/succes",
          "cancel_url": "http://localhost:4000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": user.firstname,
                  "sku": "001",
                  "price": totalPrice,
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": totalPrice
          },
          "description": "Washing Bar soap"
      }]
  };
 
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            console.log("link for paypal")
            console.log(payment.links[i].href)
            res.json({data:payment.links[i].href});
          }
        }
    }
  });
  }
  
});

router.get('/order-payment-failed/:id',async(req,res)=>{
  console.log("delete orderil ethi")
  console.log(req.params.id)
  let deletePlacedOrder =await productHelpers.deleteOrder(req.params.id)
})

router.get("/succes",verifyLogin,checkUserCartLength,async(req, res) => {
   let user = req.session.user
   let cartCount = req.session.cartCount;
  let categories = await productHelpers.getAllCategories()

   if(req.session.buynow){
     delete req.session.buynow
   }
   let  wishlistCount = 0
   if(req.session.user){
     wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
   }else{
     wishlistCount = null;
   }
  res.render("users/succes", { admin: false, user, cartCount,wishlistCount,categories});
});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

// Obtains the transaction details from paypal
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('/success')
    }
});
});

router.get("/order-history", verifyLogin, checkUserCartLength,async (req, res) => {
  console.log("order history arrived");
  let categories = await productHelpers.getAllCategories()

  cartCount = req.session.cartCount;

  user = req.session.user;
  userId = req.session.user._id;
  let  wishlistCount = 0
  if(req.session.user){
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  }else{
    wishlistCount = null;
  }
  productHelpers.getOrders(userId).then((response) => {
    let order = response;
    console.log("order in user page")
    console.log(order)

   res.render("users/order-history", { admin: false, user, cartCount,order,wishlistCount,categories});
  });
});
// router.get('/view-order',verifyLogin,checkUserCartLength,async(req,res)=>{
//   user = req.session.user
//   cartCount = req.session.cartCount
//  await productHelpers.viewOrder(req.session.user._id).then((response)=>{
//    let view = response;

//   res.render('users/order-history-view',{admin:false,user,cartCount,view})
//  })
// })


router.get("/view-order",verifyLogin,checkUserCartLength,async(req,res)=>{
  let categories = await productHelpers.getAllCategories()
  
    let user = req.session.user;
    let orderId = req.query.id;
    let  wishlistCount = 0
 if(req.session.user){
   wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
 }else{
   wishlistCount = null;
 }
    let cartCount = req.session.cartCount;
    productHelpers.viewOrder(orderId).then((products) => {
      console.log(products, "---------");
      res.render("users/orderView", { admin: false, user,products,wishlistCount,cartCount,categories});
    });
  }
);


// ...............................................cancel order..................
router.post("/cancel", (req, res) => {
  productHelpers.cancelOrder(req.body).then((response)=>{
    res.json({ status: response });
  });
  
}); 



// .....................................................otp login with twilio........................................
router.post("/phone", (req,res) => {
  console.log("req body 6666666666666666666111111111111111111")
console.log(req.body)
  userHelper.findUser(req.body).then((result) => {
    if (result) {
      let otp = req.body.phone;
      twilio.verify
        .services(serviceID)
        .verifications.create({
          to: `+91${otp}`,
          channel: "sms",
          message: "otp",
        })
        .then((response) => {
          if (response.status == "pending") {
            res.json({ status: true });
          } else {
            res.json({ status: false });
          }
      
        });
    }else{
      res.json(false)
    } 
  });
});
router.post("/otp-login", (req, res) => {
  let otp = req.body.otp;
  let number = req.body.number;
 
  twilio.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((response) => {
     
      if (response.status == "approved" && response.valid) {
     
        userHelper.findUser({ phone: number }).then((result) => {
          if (result) {
            
            req.session.user = result;
            req.session.loggedIn = true;
            res.json({ status: true });
          } else {
            
            res.json({ status: false });
          }
        });
      } else {
        
        res.json({ status: false });
      }
    })
    .catch((err) => {
      console.log("error" + err);
    });
});



// ......................address save to database..............................

router.post('/add-address',(req,res)=>{

  let userId = req.session.user._id

  var addressId = uuid.v4()
 let addAddress = productHelpers.addAddress(req.body,addressId,userId)
 console.log("add Address in form")
 console.log(addAddress)
  res.json({status:true})
})


// .........................................get address by single with its id to checkout page.........................
router.post('/display-address',async(req,res)=>{
  let userId = req.session.user._id
  let data = await productHelpers.getAddress(userId,req.body)
  res.json({status:data})
})







// ...........................................verify payment razorpay.....................
router.post('/verify-payment',(req,res)=>{
  console.log("payment body")
  console.log(req.body)
  productHelpers.verifyPayment(req.body).then((response)=>{
    productHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:''})
  })
})



router.get('/user-profile',verifyLogin,checkUserCartLength,async(req,res)=>{
  let categories = await productHelpers.getAllCategories()


 let userId = req.session.user._id
 let cartCount = req.session.cartCount

 let data = await productHelpers.getAddressId(userId)

 let  wishlistCount = 0
 if(req.session.user){
   wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
 }else{
   wishlistCount = null;
 }
 let user =await userHelpers.findOneUser(userId)
 console.log("_____________________________________finded")
 console.log(user)
 productHelpers.getOrders(userId).then((response) => {
   let order = response;
 
  res.render('users/user-profile',{admin:false,user,cartCount,order,data,wishlistCount,categories})
 })
})

router.get('/edit-address',verifyLogin,checkUserCartLength,async(req,res)=>{
  let categories = await productHelpers.getAllCategories()

  let  user = req.session.user
  let  wishlistCount = 0
  if(req.session.user){
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  }else{
    wishlistCount = null;
  }
  let userId = req.session.user._id
 
  let  cartCount = req.session.cartCount
   let Aid = req.query.id
  productHelpers.getSingleAddress(userId,Aid).then((data)=>{
   
    res.render('users/edit-address',{admin:false,user,cartCount,Aid,data,wishlistCount,categories})
  })
 })
 router.post('/edit-single-address',async(req,res)=>{
 
   let userId = req.session.user._id
  
  await productHelpers.ediAddress(req.body,userId).then((response)=>{
    res.json({status:true})

  })
   
 })
 
 router.post('/delete-address',(req,res)=>{
   console.log("ivde ondo mone")
   console.log(req.body)
  productHelpers.deleteAdress(req.body).then((response)=>{
    res.json({status:true})
  })
 })

 router.post('/user-profile',async(req,res)=>{
   console.log("ivde oke ethuo mone")
   console.log(req.body)
  //  console.log(req.body.userId)
  let currentUser = await userHelper.getUser(req.body.userId)
  await  userHelper.editProfile(req.body,currentUser).then((response)=>{
    console.log("ivde aanu new user --------------------------------  ")
     console.log(response)
     res.redirect('/user-profile')
   })
 })
router.post('/change-password',async(req,res)=>{
  console.log("body vallom vanno")
  console.log(req.body)
 user = req.session.user
  await  userHelper.changePassword(req.body,user).then((response)=>{
    console.log("/////////////////////////////")
    console.log(response)
    res.json({status:response})
  })
})
router.post('/apply-coupon',async(req,res)=>{
  let userId= req.session.user._id

  console.log("click cheyy mwone njn varum")
  console.log(userId)
  console.log(req.body)
  let total = await productHelpers.getTotalAmount(userId);
  let subtotalA
  let totalAmount = 0
  for(var i in total){
    totalAmount=totalAmount+total[i].subtotal
  }
  let user = req.session.user
  let offerAmount = 0
  let status;
  let message ;

  // chekcing the coupon details
   await userHelper.compareCoupon(req.body,totalAmount,userId).then((amount)=>{
     status = true
     offerAmount= amount
        req.session.offerDetails = {
          offerAmount:offerAmount,
          couponCode:req.body.coupon
        }
      }).catch((data)=>{
      
        message = data

        status= false
      })
     
     

    // sendng the response belongs to the result
    res.json({status,offerAmount,message})
 
})
 router.get('/create-address',verifyLogin,checkUserCartLength,async(req,res)=>{
   console.log("ivde vannoda")
  let  user = req.session.user
  let categories = await productHelpers.getAllCategories()

  let  cartCount = req.session.cartCount
  let  wishlistCount = 0
  if(req.session.user){
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  }else{
    wishlistCount = null;
  }
   res.render('users/create-address',{admin:false,user,cartCount,wishlistCount,categories})
 })
router.post('/create-address',(req,res)=>{
  console.log("ivdem vare vanoda")
  var adId = uuid.v4()
  console.log(adId)
  userId = req.session.user._id
  console.log("****************")
  console.log(userId)
  productHelpers.createAddress(req.body,adId,userId).then((response)=>{
    
  })
  res.redirect('/user-profile')
  
})

router.get('/wishlist',verifyLogin,checkUserCartLength,async(req,res)=>{
  let categories = await productHelpers.getAllCategories()

  let  user = req.session.user
  let  userId = req.session._id
  let  cartCount = req.session.cartCount
  let  wishlistCount =0
  if(req.session.user){
    wishlistCount = await productHelpers.getWishlistCount(req.session.user._id)
  }else{
    wishlistCount = null;
  }
  let wishlist =await  productHelpers.getWishlistProducts(userId)
  console.log(wishlist)
  res.render('users/wishlist',{admin:false,user,cartCount,wishlistCount,wishlist,wishlistCount,categories})
})

router.get("/add-to-wishlist/:id", verifyLogin, (req, res) => {
  
  let proId = req.params.id;
  console.log(proId)
  let userId = req.session.user._id;
  if(req.session.user){
    productHelpers.addToWishlist(proId, userId).then((response) => {
      res.json({ status: true });
    });
  }else{
    res.json({status:false})
  }
});

router.post("/delete-wishlist-item", (req, res) => {
 
  productHelpers.deleteItem(req.body).then((response) => {
    res.json({ status:true});
  });
});


module.exports = router;
