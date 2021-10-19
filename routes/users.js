var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers');
const { response } = require('express');
 

const checkUserCartLength=async(req,res,next)=>{
  let user = req.session.user || false
  let cartCount = 0;
  if(user){
    cartCount = await productHelpers.getCartProducts(user._id)
    cartCount = cartCount.length
  }
  req.session.cartCount =cartCount
  next()
}

function verifyLogin(req,res,next){
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user
  
  let cate = req.query.cate
  let cartCount
  if(req.session.user){
     cartCount =await productHelpers.getCartCount(req.session.user._id)
    
    }else{
      cartCount=null
    } 
  let categ =await productHelpers.getCategory(cate)
  
  let categories =await productHelpers.getAllCategories()
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/landing', {admin:false,products,user,categories,categ,cartCount});
  })
});

router.get('/signup',(req,res)=>{
  if(req.session.SignIn){
    res.redirect('/')
  }else{
  res.render('users/signup',{admin:false,user:false})
  }
})
router.post('/signup',(req,res)=>{
  
  userHelper.addUsers(req.body).then((response)=>{
    
   req.session.user = response
  
   
   req.session.SignIn = true
    res.redirect('/')
  })
  
})
router.get('/login',(req,res)=>{
  let id = req.query.cate
  
  if(req.session.loggedIn&&req.session.user){
    res.redirect('/')
  }else{
    res.render('users/login',{admin:false,user:false})
  }
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status && response.user.status){
      req.session.user = response.user
      req.session.loggedIn = true
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  delete req.session.user
  res.redirect('/')
})

router.get('/product-view/:id',checkUserCartLength,(req, res)=>{
  let proId = req.params.id
  let user= req.session.user || false
  let cartCount = req.session.cartCount
  productHelpers.productView(proId).then((product)=>{
    
    res.render('users/product-view',{admin:false,user,product,cartCount})
  })
})
router.get('/cart',verifyLogin,checkUserCartLength,async(req,res)=>{
  let user = req.session.user
  let userId = req.session.user._id
  let cartCount = req.session.cartCount
  let subtotal = await productHelpers.getSubTotal(userId)

  let total =await productHelpers.getTotalAmount(userId)
  
  await productHelpers.getCartProducts(userId).then((products)=>{
   

    res.render('users/cart',{admin:false,user, cartCount, products,total,subtotal})
  })
  
 
})




router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  
  let proId = req.params.id 
  let userId = req.session.user._id
  
  productHelpers.addToCart(proId,userId).then((response)=>{
    res.json({status:true})
  })
   
  
  
})

router.post('/change-quantity',(req,res,next)=>{
  
  productHelpers.changeQuantity(req.body).then((response)=>{
    res.json({status:response})
  })
})

router.post('/delete-cart-item',(req,res)=>{
  
  productHelpers.deleteItem(req.body).then((response)=>{
  
    res.json({status:true})
  })
})


router.get('/checkout',verifyLogin,checkUserCartLength,(req,res)=>{
    let user = req.session.user
    let cartCount = req.session.cartCount
    res.render('users/checkout',{admin:false,user,cartCount})
})

router.post('/place-order',async(req,res)=>{
  console.log("req body")
  console.log(req.body)
  
   let products = await productHelpers.getProductList(req.body.userId)
   
   let total = await productHelpers.getTotalAmount(req.body.userId)
  
   productHelpers.placeOrder(req.body,products,total).then((response)=>{
     res.json({status:true})
    
   })
  
})
router.get('/success',verifyLogin,checkUserCartLength,(req,res)=>{
  cartCount = req.session.cartCount
  user = req.session.user
  res.render('users/success',{admin:false,user,cartCount})
})

router.get('/order-history',verifyLogin,checkUserCartLength,(req,res)=>{
  
  cartCount = req.session.cartCount
 
  user = req.session.user
 
 userId = req.session.user._id
 
  productHelpers.getOrders(userId).then((response)=>{
    let order = response
    
    console.log(order)
    res.render('users/order-history',{admin:false,user,cartCount,order})
  })
    
  
})
// router.get('/view-order',verifyLogin,checkUserCartLength,async(req,res)=>{
//   user = req.session.user
//   cartCount = req.session.cartCount
//  await productHelpers.viewOrder(req.session.user._id).then((response)=>{
//    let view = response;
 
//   res.render('users/order-history-view',{admin:false,user,cartCount,view})
//  })
// })
router.get('/view-order/:id',verifyLogin,checkUserCartLength,async(req,res)=>{
  let user = req.session.user
 let orderId = req.params.id
 
 let cartCount = req.session.cartCount
  await productHelpers.viewOrder(orderId)
 res.render('users/orderView',{admin:false,user})
  
})


router.post('/cancel',(req,res)=>{
  productHelpers.cancelOrder(req.body)
    res.json({status:true})
})
module.exports = router;
