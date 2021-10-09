var express = require('express');
var router = express.Router();

var userHelper = require('../helpers/userHelpers')

const productHelpers = require('../helpers/productHelpers');
const { response } = require('express');
var uuid = require('uuid')
var admin = 'admin'
var password = 12345
/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('admin/adminlogin',{admin:true});
  
});

router.post('/',(req,res)=>{
  if(req.body.name==admin && req.body.password==password ){
    res.redirect('/admin/adminlanding')
  }else{
    res.render('admin/adminlogin',{admin:true});
  }
})
router.get('/adminlanding', function(req, res, next) {
  res.render('admin/adminlanding',{admin:true});
});

router.get('/userlist', function(req, res, next) {
  userHelper.getAllUsers().then((users)=>{
    res.render('admin/userlist',{admin:true,users});
  })
});
router.get('/category', function(req, res, next) {
  res.render('admin/category',{admin:true});
});
router.get('/block/:id',(req,res)=>{
  let userId = req.params.id
  
   userHelper.blockUser(userId).then((response)=>{
     
    res.redirect('/admin/userlist')
  })
})
router.get('/unblock/:id',(req,res)=>{
  let userId = req.params.id
 
   userHelper.unblockUser(userId).then((response)=>{console.log("admin page")
    res.redirect('/admin/userlist')
  })
})
router.get('/products', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/products',{admin:true,products});
  })
 
});
router.get('/add-product', function(req, res, next) {
  res.render('admin/add-product',{admin:true});
});
router.post('/add-product',(req,res)=>{
 
  
  var imageId1 = uuid.v4()
  var imageId2 = uuid.v4()
  var imageId3 = uuid.v4()
  
  
 productHelpers.addProducts(req.body,imageId1,imageId2,imageId3).then((response)=>{
   let image1 = req.files.image1
   let image2 = req.files.image2
   let image3 = req.files.image3
   
   image1.mv('./public/product-images/image1/'+response.image1+'.jpg',
   image2.mv('./public/product-images/image2/'+response.image2+'.jpg',
   image3.mv('./public/product-images/image3/'+response.image3+'.jpg',(err,done)=>{
    if(!err){
     res.redirect('/admin/add-product')
    }else{
      console.log(err);
    }
  })))
  
 })
})
router.get('/delete/:id',(req,res)=>{
  let proId = req.params.id
  
  productHelpers.deleteProducts(proId).then((response)=>{
    res.redirect('/admin/products')
  })
  
})
router.get('/edit-product/:id', async(req, res)=> {
  let proId = req.params.id
  let product =await productHelpers.getProductDetails(proId)
      res.render('admin/edit-product',{admin:true,product})
});
router.post('/edit-product/:id',(req,res)=>{
  let proId = req.params.id
  productHelpers.editProducts(req.body,proId).then((response)=>{
    console.log("ntha response")
    console.log(response)
    
    if(req.files.image1 || req.files.image2 || req.files.image3){
   let image1 = req.files.image1
   let image2 = req.files.image2
   let image3 = req.files.image3 
   image1.mv('./public/product-images/image1/'+response.image1+'.jpg',
   image2.mv('./public/product-images/image2/'+response.image2+'.jpg',
   image3.mv('./public/product-images/image3/'+response.image3+'.jpg',(err,done)=>{
    if(!err){
     res.redirect('/admin/products')
    }else{
      console.log(err);
    }
  })))
    }
  })
})

module.exports = router;
