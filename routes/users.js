var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user
  

  let cate = req.query.cate
  console.log(cate)
  let categ =await productHelpers.getCategory(cate)
  console.log("categ")
  console.log(categ)
  let categories =await productHelpers.getAllCategories()
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/landing', {admin:false,products,user,categories,categ});
  })
});
// router.get('/:categoryname',(req,res)=>{
//   let cate = req.params.categoryname
//   productHelpers.getCategory(cate)
//   res.redirect('/')
// })
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
  console.log("jjjjjjjjjjjj"+id);
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
router.get('/cart',(req,res)=>{
  res.render('users/cart',{admin:false,user:true})
})


module.exports = router;
