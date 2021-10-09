var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user
  console.log("sined up")
  console.log(user)

  var banner = [{
    image1 : "https://big-skins.com/frontend/foxic-html-demo/images/skins/fashion/slider/slide-fashion-01.webp"
  },
  {
    image2 : "https://big-skins.com/frontend/foxic-html-demo/images/skins/fashion/slider/slide-fashion-02.webp"
  },
   
]
   var banner2 = [
     {
      image3 :"https://big-skins.com/frontend/foxic-html-demo/images/skins/fashion/banner-fashion2-full.webp"
      } 
   ]
  productHelpers.getAllProducts().then((products)=>{
   
    res.render('users/landing', {banner,banner2,admin:false,products,user});
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

module.exports = router;
