var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers');
 
 
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
     console.log("Cart count");
     console.log(cartCount)
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
    console.log(response)
   req.session.user = response
   console.log("req.session.user")
   console.log(req.session.user)
   
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

router.get('/product-view/:id',(req, res)=>{
  let proId = req.params.id
  productHelpers.productView(proId).then((product)=>{
    res.render('users/product-view',{admin:false,user:false,product})
  })
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let users = req.session.user
  let userId = req.session.user._id
 
  console.log("userid in cart page")
  console.log(userId)
  await productHelpers.getCartProducts(userId).then((products)=>{
    res.render('users/cart',{admin:false,user:true, cartCount:products.length,products})
  }).catch((err)=>{
    console.log(err)
  })
  
 
})




router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  
  let proId = req.params.id 
  let userId = req.session.user._id
  
  productHelpers.addToCart(proId,userId).then((response)=>{
    res.json({status:true})
  })
   
  
  
})

router.post('/inc-cart',(req,res)=>{
  productHelpers.changeQuantity(req.body).then((response)=>{
    
  })
})
module.exports = router;
