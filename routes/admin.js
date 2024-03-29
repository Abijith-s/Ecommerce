var express = require('express');
var router = express.Router();
var fs = require('fs')
var userHelper = require('../helpers/userHelpers')

const productHelpers = require('../helpers/productHelpers');
const { response } = require('express');
var uuid = require('uuid')
var admin = 'admin'
var password = 12345

function verifyadminLogin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.admin){
    res.redirect('/admin/adminlanding')
  }else{
    errMsg = req.session.logInErr 
    req.session.logInErr =false
  res.render('admin/adminlogin',{admin:true,logged:false,logErr:errMsg});
  }
});


router.post('/',(req,res)=>{
  if(req.body.name==admin && req.body.password==password ){
    req.session.admin = admin;
    req.session.loggedIn = true;
    res.redirect('/admin/adminlanding')
   
  }else{
    req.session.logInErr =true
    res.redirect('/admin');
  }
})


router.get('/adminlanding',async function(req, res, next) {
 if(req.session.admin&& req.session.loggedIn){

  let totalOrder = await productHelpers.totalOrders()
  let totalCustomer = await userHelper.totalCustomers()
  let totalSails = await productHelpers.totalSails()
  let totalCancelled = await productHelpers.cancelledOrders()
  let order = await productHelpers.getAllOrders()
  let RazorPay = await productHelpers.totalRazorpay()
  let paypal = await productHelpers.totalPaypal()
  let cod = await productHelpers.totalCod()
  let placed = await productHelpers.placedOrder()
  let delivered = await productHelpers.deliveredOrder()
  let cancelled = await productHelpers.cancelledOrder()
  let shipped = await productHelpers.shippedOrder()
  let weeklyReport = await productHelpers.getweeklyreport()


  res.render('admin/adminlanding',{admin:true,logged:true,totalOrder,totalCustomer,totalSails,totalCancelled,order,RazorPay,paypal,cod,placed,delivered,cancelled,shipped,weeklyReport})
 }else{
  res.redirect('/admin')
 }
});


router.get("/signout", (req, res) => {
  delete req.session.admin;
  res.redirect("/admin");
});


router.get('/userlist',verifyadminLogin, function(req, res, next) {
  userHelper.getAllUsers().then((users)=>{
    res.render('admin/userlist',{admin:true,users,logged:true});
  })
});


router.get('/category',verifyadminLogin, function(req, res, next) {
  
  productHelpers.getAllCategories().then((categories)=>{
    console.log("categorie");
    console.log(categories)
    res.render('admin/category',{admin:true,categories,logged:true});
  })
});


router.post('/category', async(req,res)=>{
  console.log("category check")
  console.log(req.body)
  productHelpers.checkCategory(req.body).then(async(response)=>{
    console.log("+++++++++++++++++++++++++")
  console.log(response)
  if(response==null){
    productHelpers.addCategories(req.body).then((result)=>{
            
                res.json(response)
              })
  }
   else{
      res.json({response})
    }
  })
  
})
router.post('/subcategory',(req,res)=>{
  console.log("hiiiiiiiiiiiiiiiiiiiiiiiii")
  console.log(req.body)
  productHelpers.checkSubcategory(req.body).then((result)=>{
    console.log(result)
    if(!result){
      productHelpers.addSubategories(req.body).then((response)=>{
        console.log("............................................")
        console.log(response)
        res.json(result)
      })
    }else{
      console.log("+++++++++++++++++++++++++++++++")
      res.json(result)
    }
  })
  
  
})



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
router.get('/products',verifyadminLogin, function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/products',{admin:true,products,logged:true});
  })
 
});
router.get('/add-product',verifyadminLogin, function(req, res, next) {
  productHelpers.findCategory().then((response)=>{
 
    res.render('admin/add-product',{admin:true,response,logged:true});
  })
  

});
router.post('/add-product',(req,res)=>{

  
  var imageId1 = uuid.v4()
  var imageId2 = uuid.v4()
  var imageId3 = uuid.v4()
  
  
 productHelpers.addProducts(req.body,imageId1,imageId2,imageId3).then((response)=>{
  let image1=req.body.image1_b64
  let image2=req.body.image2_b64
  let image3=req.body.image3_b64
 

let path1=`./public/product-images/image1/${response.image1}.jpg`
let path2=`./public/product-images/image2/${response.image2}.jpg`
let path3=`./public/product-images/image3/${response.image3}.jpg`


const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
const base64Data2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, '');
const base64Data3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, '');


fs.writeFileSync(path1,base64Data1,{encoding:'base64'})
fs.writeFileSync(path2,base64Data2,{encoding:'base64'})
fs.writeFileSync(path3,base64Data3,{encoding:'base64'})


  res.redirect('/admin/products')
  
}      )
})
router.get('/delete/:id',(req,res)=>{
  let proId = req.params.id
  
  productHelpers.deleteProducts(proId).then((response)=>{
    res.redirect('/admin/products')
  })
  
})
router.get('/edit-product',verifyadminLogin, async(req, res)=> {
  console.log("helooo")
  let proId = req.query.id
  console.log("proId in query")
  console.log(proId)
  let category =await productHelpers.findCategory()
  console.log("categories")
  console.log(category)
  let product =await productHelpers.getProductDetails(proId)
  console.log(product)
      res.render('admin/edit-product',{admin:true,product,logged:true,category})
});
router.post('/edit-product',(req,res)=>{
  console.log(req.body)
  let proId = req.body.proId
  
  productHelpers.editProducts(req.body,proId).then((response)=>{
    console.log("===============================")
    console.log(response)

    if(req.body.image1_b64){
      let image1=req.body.image1_b64
      let path1=`./public/product-images/image1/${response.image1}.jpg`
      const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
       fs.writeFileSync(path1,base64Data1,{encoding:'base64'})
    }


    if(req.body.image2_b64){
      let image2=req.body.image2_b64
      let path2=`./public/product-images/image2/${response.image2}.jpg`
      const base64Data2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path2,base64Data2,{encoding:'base64'})
    }


    if(req.body.image3_b64){
      let image3=req.body.image3_b64
      let path3=`./public/product-images/image3/${response.image3}.jpg`
      fs.writeFileSync(path3,base64Data3,{encoding:'base64'})
    }
    
    res.redirect('/admin/products')
  
  })
})
router.post('/getsubcategory',(req,res)=>{
  let cat = req.body.catname
  productHelpers.findSubCategory(cat).then((response)=>{
    res.json(response[0].subcategory)
  })
})
router.get('/deletecat/:id',(req,res)=>{
  console.log("hii")
  let catId = req.params.id
  productHelpers.deleteCategory(catId).then((response)=>{
    res.redirect('/admin/category')
  })
})
router.get('/deletesubcat/:id/:name',(req,res)=>{
  let subCatId = req.params.id
  let proName = req.params.name
  console.log("subCatID")
  console.log(subCatId)
  console.log("proName");
  console.log(proName);
  productHelpers.deleteSubCategory(subCatId,proName).then((response)=>{
    res.redirect('/admin/category')
  })
  
  
})
router.get('/view-order',verifyadminLogin,(req,res)=>{
  productHelpers.getAllOrders().then((order)=>{
    console.log("response in function call")
    console.log(order)
    res.render('admin/view-order',{admin:true,order,logged:true})
  })
})
router.post('/manage-order',(req,res)=>{
  console.log("hdsfukhsfhsdhfuihsdiufhiuh")
  console.log(req.body)
  let Id = req.body.orderId
  console.log(Id)
  let manageorder = req.body.manage
  console.log(manageorder)
  productHelpers.mangeOrder(Id,manageorder).then((response)=>{
    res.json({status:response})
  })

})
router.get('/product-offer',verifyadminLogin,async(req,res)=>{
  console.log("hii nan vannu")
 let products =await  productHelpers.getAllProducts()
 let offerProduct = await productHelpers.findOfferProducts()
  res.render('admin/product-offer',{admin:true,logged:true,products,offerProduct})
})
router.post('/product-offer',async(req,res)=>{
 await productHelpers.addProductOffer(req.body).then((response)=>{
   res.redirect('/admin/product-offer')
  })

})
router.get('/category-offer',verifyadminLogin,async(req,res)=>{
  let category =await productHelpers.getAllCategories()

  let offerProduct = await productHelpers.findOfferProducts()
  res.render('admin/category-offer',{admin:true,logged:true,category,offerProduct})
})
router.post('/category-offer',async(req,res)=>{
  productHelpers.addCategoryOffer(req.body)
  res.redirect('/admin/category-offer')
})
router.post('/findsubcategory',(req,res)=>{
  let cat = req.body.catname
  productHelpers.findSubCategory(cat).then((response)=>{
    res.json(response[0].subcategory)
  })
})
router.get('/create-coupon',(req,res)=>{
  res.render('admin/create-coupon',{admin:true,logged:true})
})
router.post('/create-coupon',(req,res)=>{
  productHelpers.addCoupons(req.body)
  res.redirect('/admin/coupon-list')
})

router.get('/coupon-list',verifyadminLogin,async(req,res)=>{
   productHelpers.findCoupons().then((result)=>{
    res.render('admin/coupon-list',{admin:true,logged:true,result})
   }) 
})


router.get('/delete-coupons',(req,res)=>{
   let couponId = req.query.id
   productHelpers.deleteCoupon(couponId)
   res.redirect('/admin/coupon-list')
})

router.get('/delete-pro-offer',(req,res)=>{
  let offerId = req.query.id
  productHelpers.deleteOffer(offerId).then((response)=>{
    res.redirect('/admin/product-offer')
  })
})

router.get('/sales',verifyadminLogin,async(req,res)=>{
  let orders;
if(req.query.startdate&&req.query.enddate){
  console.log("ivde varanond ---------------------")
   orders =await productHelpers.sortByDate(req.query)
}else if(req.query.choosedate){
  console.log("ivde infooda")
  orders = await productHelpers.chooseByDate(req.query)
}else if(req.query.enabled){
 orders = await productHelpers.getMonthlyReport()
}
else{
   orders =  await productHelpers.getAllOrders()
}
  res.render('admin/sales',{admin:true,logged:true,orders})
})
router.get('/add-banner',(req,res)=>{
  res.render('admin/add-banner',{admin:true,logged:true})
})
module.exports = router;
