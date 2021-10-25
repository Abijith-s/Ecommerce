var express = require("express");
var router = express.Router();
var userHelper = require("../helpers/userHelpers");
const productHelpers = require("../helpers/productHelpers");
const { response } = require("express");
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

function verifyLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;

  let cate = req.query.cate;
  let cartCount;
  if (req.session.user) {
    cartCount = await productHelpers.getCartCount(req.session.user._id);
  } else {
    cartCount = null;
  }
  let categ = await productHelpers.getCategory(cate);

  let categories = await productHelpers.getAllCategories();
  productHelpers.getAllProducts().then((products) => {
    res.render("users/landing", {
      admin: false,
      products,
      user,
      categories,
      categ,
      cartCount,
    });
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
  console.log('user:', user);
  
    req.session.user = user
    req.session.loggedIn = true
    res.json({status:true})

  
}else{
  console.log("njn ivde ethi")
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



router.get("/signup", (req, res) => {
  let user = req.session.user;
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("users/signup", { admin: false, user });
  }
});
router.post("/signup", (req, res) => {
  userHelper.addUsers(req.body).then((response) => {
    req.session.user = response;

    req.session.SignIn = true;
    res.redirect("/");
  });
});
router.get("/login", (req, res) => {
  let id = req.query.cate;
  
  if (req.session.loggedIn && req.session.user) {
    res.redirect("/");
  } else {
   
    res.render("users/login", { admin: false, user: false ,loginErr:req.session.loggedInErr,blockedUser:req.session.blocked});
    req.session.loggedInErr = false;
    
  }
});
router.post("/login", (req, res) => {

 
  userHelper.doLogin(req.body).then((response) => {
    console.log("status")
  console.log(response)
    if (response.status && response.user.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;
      res.redirect("/");
    }else if(response.user.status==null){
      req.session.blocked = true
    } else {
      req.session.loggedInErr =true
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  delete req.session.user;
  res.redirect("/");
});

router.get("/product-view", checkUserCartLength, (req, res) => {
  let proId = req.query.id;
  console.log("proId")
  console.log(proId)
  let user = req.session.user || false;
  let cartCount = req.session.cartCount;
  productHelpers.productView(proId).then((product) => {
    res.render("users/product-view", {
      admin: false,
      user,
      product,
      cartCount,
    });
  });
});
router.get("/cart", verifyLogin, checkUserCartLength, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = req.session.cartCount;
  let subtotal = await productHelpers.getSubTotal(userId);
  let total = await productHelpers.getTotalAmount(userId);
 
  await productHelpers.getCartProducts(userId).then((products) => {
    console.log("products")
    console.log(products)
    console.log(subtotal)
    console.log(total)
    res.render("users/cart", {
      admin: false,
      user,
      cartCount,
      products,
      total,
      subtotal,
    });
  });
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  let userId = req.session.user._id;

  productHelpers.addToCart(proId, userId).then((response) => {
    res.json({ status: true });
  });
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
  productHelpers.deleteItem(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.get("/checkout", verifyLogin, checkUserCartLength,async (req, res) => {
  let user = req.session.user;
  userId = req.session.user._id
  console.log("userID")
  console.log(userId)
  let cartCount = req.session.cartCount;
  let total = await productHelpers.getTotalAmount(userId)
  let addresses =await productHelpers.getAddressId(userId) 
  console.log("addrsses")
  console.log(addresses)
  res.render("users/checkout", { admin: false, user, cartCount ,addresses,total});
});

router.post("/place-order", async (req, res) => {
  console.log("req body");
  console.log(req.body);
  console.log(req.body.payment)
  let user = req.session.user
  console.log(user)
  let userId = req.session.user._id
  console.log(userId)
  let PaymentMethod = req.body.payment
  if(req.body.saveAddres){
    var addressId = uuid.v4()
    productHelpers.addAddress(req.body,userId,addressId)
  }
  if(req.body.payment == 'COD'){
    let products=await productHelpers.getProductList(userId)
    let total = await productHelpers.getTotalAmount(userId)
    console.log("total and producst ")
    console.log(total[0].total)
    console.log(products)
    productHelpers.placeOrder(req.body,products,total,PaymentMethod,userId).then((result)=>{
      res.json({status:result})
    })
  }else{
    console.log("ee casil varanondo")
    let products=await productHelpers.getProductList(userId)
    let total = await productHelpers.getTotalAmount(userId)
    productHelpers.placeOrder(req.body,products,total,PaymentMethod,userId).then((result)=>{

      let orderId = result._id
      console.log("orderId ")
      console.log(orderId)

      productHelpers.generateRazorPay(orderId,total).then((response)=>{
        console.log("response of razor pay")
        console.log(response)
        res.json({response,data:response,user:user})
      })
    })
    
  }
  
});
router.get("/success",verifyLogin,checkUserCartLength,(req, res) => {
   let user = req.session.user
   let cartCount = req.session.cartCount;
  res.render("users/success", { admin: false, user, cartCount });
});

router.get("/order-history", verifyLogin, checkUserCartLength, (req, res) => {
  console.log("order history arrived");
  cartCount = req.session.cartCount;

  user = req.session.user;
  userId = req.session.user._id;

  productHelpers.getOrders(userId).then((response) => {
    let order = response;
    console.log("order in user page")
    console.log(order)

   res.render("users/order-history", { admin: false, user, cartCount,order });
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
    let user = req.session.user;
    let orderId = req.query.id;
  
    let cartCount = req.session.cartCount;
    productHelpers.viewOrder(orderId).then((products) => {
      console.log(products, "---------");
      res.render("users/orderView", { admin: false, user,products});
    });
  }
);

router.post("/cancel", (req, res) => {
  productHelpers.cancelOrder(req.body);
  res.json({ status: response });
}); 
router.post("/phone", (req, res) => {

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
    } else {
      res.json({ status: "user not exist" });
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
router.post('/add-address',(req,res)=>{

  let userId = req.session.user._id

  
  var addressId = uuid.v4()
 let addAddress = productHelpers.addAddress(req.body,addressId,userId)
 console.log("add Address in form")
 console.log(addAddress)
  res.json({status:true})
})
router.post('/display-address',async(req,res)=>{
  
  console.log("body in address")
  console.log(req.body)
 
  let userId = req.session.user._id
  let data = await productHelpers.getAddress(userId,req.body)
  
  res.json({status:data})
})
// router.post('/edit-address',(req,res)=>{
 
//   console.log("usrId oke varuo")
//   console.log(req.body)
 
//   productHelpers.editAddress(req.body)
// })
// router.get('/delete-address',(req,res)=>{
//   userId = req.query.id
//   addressId = req.query.addressId
//   console.log(userId)
//   console.log(addressId)
//  productHelpers.deleteAdress(userId,addressId).then((response)=>{

//    res.redirect('/checkout')
//  })
// })
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
module.exports = router;
