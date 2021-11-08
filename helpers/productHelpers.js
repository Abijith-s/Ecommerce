const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId
 const Razorpay = require('razorpay')
const bcrypt = require('bcrypt')
const { response } = require('express')
const { resolve } = require('path')
const userHelpers = require('./userHelpers')
var instance = new Razorpay({
    key_id: 'rzp_test_LqsPiBnf3p2Kjm',
    key_secret: 'gj980xGE40154zsn2DvdGqUI',
  });
// schema for product collection
const productSchema = new mongoose.Schema({
    productname:String,
    description:String,
    price:Number,
    offerprice:Number,
    offerpercentage:Number,
    enddate:Date,
    quantity:Number,
    category:String,
    subcategory:String,
    image1:String,
    image2:String,
    image3:String
})
// schema for category
const catergorySchema = new mongoose.Schema({
    categoryname:String,
    subcategory:Array
})
//collection for category
const categoryInfo = mongoose.model('category',catergorySchema)
// schema for cart
const cartSchema = new mongoose.Schema({
    user:String,
    products:Array
})
// collection name for cart
const cartInfo = mongoose.model('cart',cartSchema)    
   
//collection for products
const productInfo = mongoose.model('products',productSchema)
//schema for order
const orderSchema = new mongoose.Schema({
  deliverydetails:Object,
  userId:String,
  paymentmethod:Number,
  products:Array,
  totalamount:String,
  status:String,
  date:Date,
  paymentMethod:String,

})
//schema for address
const addressSchema = new mongoose.Schema({
    userId:String,
    address:Array
})
//collection for orders 
const orderInfo =  mongoose.model('orders',orderSchema)
//collection for Address
const addressInfo = mongoose.model('address',addressSchema)

//Schema for coupons
const couponInfo = require("./couponSchema")

//Schema for wishlist
const wishlistSchema = new mongoose.Schema({
    user:String,
    products:Array
})
//collection for wishList
const wishlistInfo = mongoose.model('wishlist',wishlistSchema)
 
module.exports={
  addProducts  : (product,id1,id2,id3)=>{
      console.log("product")
      console.log(product)
    return new Promise((resolve,reject)=>{
        const products = new productInfo({
            productname:product.productname,
            description:product.description,
            price:product.price,
            quantity:product.quantity,
            category:product.category,
            subcategory:product.subcategory,
            image1:id1,
            image2:id2,
            image3:id3
            
        })
        products.save((err,details)=>{
            if(err){
                console.log("error"+err);
            }else{
            
            resolve(details)
            }
        })
    })
  },
  getAllProducts:()=>{

      return new Promise(async(resolve,reject)=>{
          let products =await productInfo.find().lean()
     
          resolve(products)
      })
  },
  deleteProducts:(proId)=>{
    return new Promise(async(resolve,reject)=>{
    await productInfo.remove({_id:proId}).then((response)=>{
         
         resolve(response)
     })
    })
  },
  getProductDetails : (proId)=>{
    return new Promise(async(resolve,reject)=>{
       await productInfo.findOne({_id:proId},).then((response)=>{
            resolve(response)
        })
    })
  },
  editProducts:(product,proId)=>{
      console.log("###################################")
      return new Promise(async(resolve,reject)=>{
         await productInfo.updateOne({id:proId},{$set:{
            productname:product.productname,
            description:product.description,
            price:product.price,
            category:product.category,
            subcategory:product.subcategory,
            quantity:product.quantity
          }}).then(async(response)=>{
              let product = await productInfo.findOne({_id:proId});
            let res = {
                image1:product.image1,
                image2:product.image2,
                image3:product.image3
            }  
            console.log("edit product")
            console.log(response)

            resolve(res)
          })
      })
  },
  productView:(proId)=>{
     
      return new Promise(async(resolve,reject)=>{
       let product = await productInfo.findOne({_id:proId})
            resolve(product)
       })
    },
    addCategories:(body)=>{
       
        return new Promise((resolve,reject)=>{
            const categories = new categoryInfo({
                categoryname:body.categoryname,
                subcategory:body.subcategoryname
            })
            categories.save((err,details)=>{
                if(err){
                    console.log("error"+err);
                }else{
                    resolve(details)
                }
            })
        })
    },
    checkCategory:(body)=>{
        console.log("check category body")
        console.log(body)
        return new Promise((resolve,reject)=>{
            categoryInfo.findOne({categoryname:body.categoryname}).then((response)=>{
                resolve(response)
            })
        })
    },
    checkSubcategory:(body)=>{
        return new Promise(async(resolve,reject)=>{
           await categoryInfo.findOne({categoryname:body.category}).then((result)=>{
                let sub = result.subcategory
                console.log(sub)
                if(sub.indexOf(body.subcategoryname)==-1){
                    resolve(false)
                }else{
                    resolve(true)
                } 
            })
        })
    },
    addSubategories:(body)=>{
        console.log("=========================")
        console.log(body)
        console.log(body.subcategoryname,body.category)
        return new Promise(async(resolve,reject)=>{
            
                let updatedCategory = await categoryInfo.updateOne({categoryname:body.category},{$push:{subcategory:body.subcategoryname}},{upsert:true}).then((response)=>{
                    console.log("databasinn olla response")
                    console.log(response);
                    resolve(response)
                })
         })  
    },
    getAllCategories:()=>{
      return new Promise(async(resolve,reject)=>{
        let categories =await categoryInfo.find().lean()
        resolve(categories)
      })
      
    },
    findCategory:()=>{
        return new Promise((resolve,reject)=>{
            let categories = categoryInfo.find().lean()
            
            resolve(categories)
        })
      
    },
    findSubCategory:(cat)=>{
        return new Promise(async(resolve,reject)=>{
           await categoryInfo.find({categoryname:cat}).lean().then((response)=>{
                resolve(response)
            })
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            categoryInfo.findOne({_id:id}).then((res)=>{
                productInfo.deleteOne({category:res.categoryname}).then((response)=>{
                    console.log("mwone njn pova bei")
                    console.log(response)
                })
             })
            categoryInfo.deleteOne({_id:id}).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteSubCategory : (id,name)=>{
        console.log("------------------------------")
        console.log(name)
        return new Promise((resolve,reject)=>{
            categoryInfo.findOne({_id:id},{subcategory:name}).then((result)=>{
                console.log("+++++++++++++++++++++++++/////////////////// ")
                productInfo.deleteMany({subcategory:name}).then((res)=>{
                    console.log("_____________________________________")
                    console.log(res)
                })
            })
            categoryInfo.updateOne({_id:id},{$pull:{subcategory:name}}).then((response)=>{

                resolve(response)
            })
        })
    },
    getCategory:(categoryname)=>{
       
        return new Promise((resolve,reject)=>{
          let cate =  productInfo.find({category:categoryname}).lean()
        
          resolve(cate)
        })

    },
    getSubCategoryProducts:(subcat,cat)=>{
        return new Promise(async(resolve,reject)=>{
         let subCatPro =await   productInfo.find({category:cat,subcategory:subcat})
         console.log("*************************subcatpro")
         console.log(subCatPro)
         resolve(subCatPro)
        })
    },
   
    addToCart :(proId,userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            let proObj={
                items : objectId(proId),
                quantity:1
            }
            let userCart =await cartInfo.findOne({user:userId})
           
            if(userCart){
                let proExist = userCart.products.findIndex(e=> e.items==proId)
                
                if(proExist!=-1){
                    cartInfo.updateOne({user:userId,'products.items':objectId(proId)},{$inc:{'products.$.quantity':1}}).then((res)=>{
                      
                       resolve(res)

                    })
                }else{
                cartInfo.updateOne({user:userId},
                    {
                        $push:{
                            products:proObj
                        }
                    }).then((response)=>{
                       
                        resolve(response)
                    })
            }
            }else{
                const cart = new cartInfo({
                    user:userId,
                    products:proObj
                })
                cart.save((err,details)=>{
                    if(err){
                        console.log("error"+err)
                    }else{
                        resolve(details)
                    }
                })
            }
        })
    },
    getCartProducts:(userId)=>{
       
        return new Promise(async(resolve,reject)=>{
            cartInfo.aggregate([
                {
                    $match:{user:userId}
                },
                {
                    $unwind:'$products'
                },
               
                {
                    $lookup:{
                        from:'products',
                        localField:'products.items',
                        foreignField:'_id',
                        as:'cartproducts'
                    }
                },
                
                {$unwind:"$cartproducts"}
                ]).then((result)=>{
                    
                    resolve(result)
                })
          
            
        })
            
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart =await cartInfo.findOne({user:userId})
            if(cart){
                count=cart.products.length
            }
            
            resolve(count)
        })
    },
    changeQuantity:(body)=>{
        let count = parseInt(body.count)
        console.log(body.count,body.cart,body.product)
        return new Promise((resolve,reject)=>{
           
                cartInfo.updateOne({_id:objectId(body.cart),'products.items':objectId(body.product)},{$inc:{'products.$.quantity':count}}).then((res)=>{
                  
                   if(count==1){
                       resolve(true)
                   }else{
                       resolve(false)
                   }
                   

                })
        })
    },
    deleteCartItem:(id)=>{
       
        return new Promise((resolve,rejection)=>{
            let userId = id.userId
            let proId = id.proId
            cartInfo.updateOne({user:userId},{$pull:{products:{items:objectId(proId)}}}).then((res)=>{
           
               console.log(res)
                resolve(true)
            })
        })
     
    },
    getTotalAmount:(body)=>{
        return new Promise((resolve,reject)=>{
            let userId = body
            cartInfo.aggregate([
                {
                    $match:{user:userId}
                },
                {
                    $unwind:'$products'
                },
               
                {
                    $lookup:{
                        from:'products',
                        localField:'products.items',
                        foreignField:'_id',
                        as:'cartproducts'
                    }
                },
                
                {
                    $unwind:"$cartproducts"
                },
                // {
                //     $group:{
                //         _id:null,
                //      total:{
                //        $sum:{$multiply:['$products.quantity','$cartproducts.price']}  
                //      }
                //     }
                // }
                ]).then((result)=>{
                   




                //    we need to find the subtotal ?  1 we need to find the offer price. if exist offer price * qty and it will attach to the object , if not exist price * qty to be return as subtotal

                //   let alldetail  =result.map (i=> i.offer? {...i , subtota: i.cartprodut.offer * i.pro.qty }: {...i,sub: i.carp.prce * i.pro.qty})
                  
                
                  let cartDetails = result.map(i=>i.cartproducts.offerprice?{...i,subtotal:(i.cartproducts.offerprice)*(i.products.quantity)}:{...i,subtotal:(i.cartproducts.price)*(i.products.quantity)})
                    resolve(cartDetails)
                })
       
    
        })
    },
    getSubTotal:(body)=>{
       
        return new Promise((resolve,reject)=>{
            let userId = body
            
            cartInfo.aggregate([
                {
                    $match:{user:userId}
                },
                {
                    $unwind:'$products'
                },
               
                {
                    $lookup:{
                        from:'products',
                        localField:'products.items',
                        foreignField:'_id',
                        as:'cartproducts'
                    }
                },
                
                {
                    $unwind:"$cartproducts"
                },
                {
                    $project:{
                        _id:null,
                     subtotal:{
                       $multiply:['$products.quantity','$cartproducts.price'] 
                     }
                    }
                }
                ]).then((result)=>{
                    
                    resolve(result)
                })

        })
    },
getProductList:(userId)=>{
    
    return new Promise((resolve,reject)=>{
        cartInfo.findOne({user:userId}).then((res)=>{
            resolve(res)
        })
     
    })
},
placeOrder:(address,products,total,paymentMethod,userId,flag)=>{
  

  
    return new Promise((resolve,reject)=>{
        
        let  status = 'placed';
        
        
      
         const orders = new orderInfo({
        
         userId:userId,
         deliverydetails:address,
         products:[...products.products],
         totalamount:total,  
         status:status,
         paymentMethod:paymentMethod,
         date:new Date().toISOString().replace(/T/,' ').replace(/\..+/,''),
        })
        orders.save((err,details)=>{
            if(err){
             console.log("error"+err)
            }else{
        
                resolve(details)
            }

    if(flag!=1){
         cartInfo.deleteOne({user:userId}).then((res)=>{
           
             
         })
        }
        })
       
    })
},
getOrders:(userId)=>{
    return new Promise((resolve,reject)=>{
     orderInfo.find({userId:userId}).lean().then((res)=>{
       resolve(res)
     })
       
    })
},
viewOrder:(orderId)=>{
    console.log("orderID")
   console.log(orderId)
    return new Promise((resolve,reject)=>{
         let orderNewId = objectId(orderId)
      orderInfo.aggregate([
            {$match:{_id:orderNewId}},
            {$unwind:"$products"},
            {$lookup:{
                from:"products",
                localField:"products.items",
                foreignField:"_id",
                as:"details"

            }}
        ]).then((rs)=>{
            console.log(rs[0])  

            resolve (rs)
        })
       
 
    })
  
   
},
cancelOrder:(orderId)=>{

    console.log(orderId)
    let orderID = orderId.orderId
    console.log("orderID")
    console.log(orderID)
    var ordersId = objectId(orderID)
    console.log(ordersId)
    return new Promise(async(resolve,reject)=>{
       await orderInfo.updateOne({_id:ordersId},{$set:{status:"cancelled"}}).then((response)=>{
      resolve(response)
    })
    })
},
getAllOrders:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find().then((res)=>{
         
            resolve(res)
        })
    })
   
},
mangeOrder:(Id,status)=>{
    
    return new Promise(async(resolve,reject)=>{
    let orderId = objectId(Id);

      await orderInfo.updateOne({_id:orderId},{$set:{status:status}}).then((response)=>{
       
        resolve(response)
      })
      
     
    })
   
},
addAddress:(body,userId,addressId)=>{
    
 return new Promise(async(resolve,reject)=>{
    
    
     let addressObj ={
         addressId:addressId,
         name:body.name,
         email:body.email,
         phone:body.phone,
         pincode:body.pincode,
         addressname:body.addressname,
         address:body.address,
        
     }
     addressInfo.updateOne({userId:userId},{$push:{address:addressObj}},{upsert:true}).then((result)=>{
         resolve(result)
     })
      
        
 })
},
getAddressId:(userId)=>{
    
    return new Promise((resolve,reject)=>{
    addressInfo.aggregate([
       {$match:{userId:userId}},
       {$unwind:"$address"}
    ]).then((res)=>{
        resolve(res)
    })
    
   
})
},
getAddress:(userId,aid)=>{
    return new Promise(async(resolve,reject)=>{
        // addressID = objectId(addressId)
        let addressFeild = "address.addressId"
  
       


        
        let addressId ="address.addressId"
        let singleAddress =await addressInfo.aggregate([
            {$match:{userId:userId}},
            {$unwind:"$address"},
            {$match:{[addressFeild]:aid.addressId}}
        ])
        
        resolve(singleAddress[0])
        
         
    })
},
getSingleAddress:(userId,aid)=>{
    return new Promise(async(resolve,reject)=>{
        // addressID = objectId(addressId)
        let addressFeild = "address.addressId"
        
       


        
        let addressId ="address.addressId"
        let singleAddress =await addressInfo.aggregate([
            {$match:{userId:userId}},
            {$unwind:"$address"},
            {$match:{[addressFeild]:aid}}
        ])
      
        resolve(singleAddress[0])
        
         
    })
},
ediAddress:(body,userId)=>{
    console.log(body)
    console.log(userId)
    let name = body.name
    let email = body.email
    let address =  body.address
    let pincode = body.pincode
    let addressname = body.addressname
    let phone = body.phone
   
    return new Promise((resolve,reject)=>{
        let updatedName= "address.$.name"
        let updatedEmail =  "address.$.email"
        let updatedAddress = "address.$.address"
        let updatedPincode = "address.$.pincode"
        let updatedAddressName ="address.$.addressname"
        let updatedPhone = "address.$.phone"
    
     addressInfo.updateOne({userId:userId,address:{$elemMatch:{addressId:body.addressId}}},
            {
                $set:{
                    "address.$.name":name,
                  "address.$.email":email,
                  "address.$.address":address,
                  "address.$.pincode":pincode,
                  "address.$.addressname":addressname,
                   "address.$.phone":phone,
                }
            }
             
            ).then((res)=>{
               
                resolve(res)
            })
          
    })
},

// editAddress:(userId,body)=>{
//     // return new Promise
//     let userId = body.userId
//     let addressId = body.addressId
//     let firstname = body.firstname
//     let lastname = body.lastname
//     let addressname = body.addressname
//     let address = body.address
//     let pincode = body.pincode
//     let email = body.email
//     let phone = body.phone
//     console.log(userId)

//      addressInfo.updateOne({userId:userId},{$push:{address:{
//         firstname:addressId,
//         lastname:lastname,
//         addressname:addressname,
//         address:address,
//         pincode:pincode,
//         email:email,
//         phone:phone
//     }}}).then((res)=>{
//         console.log(res)
//     })
// },
deleteAdress:(body)=>{
    let userId = body.userID
    let Aid = body.aid

    return new Promise((resolve,reject)=>{
        addressInfo.updateOne({userId:userId},{$pull:{address:{addressId:Aid}}}).then((res)=>{
           
            resolve(res)
        })
    })
    
},
generateRazorPay:(orderID,total)=>{
  console.log("razorpay")
    return new Promise((resolve,reject)=>{
        let orderId = ""+orderID+""
       
        var options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+orderId+""
          };
          
       
          instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err)
            }else{
                console.log("new order :",order);
            
                resolve(order)
            }
           
          });
    })
},
verifyPayment:(body)=>{
        return new Promise((resolve,reject)=>{
         const   crypto = require('crypto')
         let hmac = crypto.createHmac('sha256','gj980xGE40154zsn2DvdGqUI')
         hmac.update(body['payment[razorpay_order_id]']+'|'+body['payment[razorpay_payment_id]'])
         hmac=hmac.digest('hex')
         if(hmac==body['payment[razorpay_signature]']){
             resolve()
         }else{
             reject()
         }
        })
},
changePaymentStatus:(orderId)=>{
   
    return new Promise((resolve,reject)=>{
        orderInfo.updateOne({_id:orderId},{$set:{status:'placed'}}).then((res)=>{
         
            resolve(res)
        })
    })
},
addProductOffer:(body)=>{
    let offerPercentage = body.offerpercentage
    return new Promise(async(resolve,reject)=>{
    let Price = await productInfo.findOne({productname:body.productname},{_id:0,price:1})
    console.log(Price)
    let productPrice = Price.price
    let offerPrice =Math.round( productPrice - (productPrice*offerPercentage/100))
  
     await   productInfo.updateOne({productname:body.productname},{$set:
            {
            offerpercentage:offerPercentage,
            offerprice:offerPrice,    
            enddate:body.enddate
            }
        },{upsert:true}).then((result)=>{
            resolve(result)
        })
     
   
    })
},
findOfferProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let offerProduct =await productInfo.find({offerprice:{$exists:true}})
       console.log(offerProduct)
      resolve(offerProduct)
    })
},
offerExpiration:()=>{
    return new Promise(async(resolve,reject)=>{
    let offerProduct =await productInfo.find({offerprice:{$exists:true}}).then(async(result)=>{
        console.log(result)
        let newDate = new Date()
        console.log("---------------------------------------")
        console.log(newDate)
        let OldDate
        let flag = 0
        for(i in result){
          oldDate = result[i].enddate
          console.log(oldDate)

          if(newDate>=oldDate){
            productInfo.updateOne({_id:result[i]._id},{
                $unset:{
                    offerpercentage:1,
                    offerprice:1,    
                    enddate:1
                }
            }).then((result)=>{
                console.log("++++++++++++++++++++++++++++++++++++++++++++++++")
                console.log(result)
                
            })
          }
        }
        
       
       
    })
    
    })
},
addCategoryOffer:(body)=>{
 return new Promise(async(resolve,reject)=>{
    
    console.log(body)
    let category = await productInfo.find({category:body.categoryname})
   
    console.log(category)
    for(var i in category){
        if(category[i].offerprice){
            console.log("no offer for you")
            console.log(category[i].productname)
        }else{
            let Price = category[i].price
            let OfferDiscount = Math.round((Price*body.offerpercentage)/100)
            let newPrice = Price-OfferDiscount
            console.log(newPrice)
            productInfo.updateMany({_id:category[i]._id},{
                $set:{
                    offerprice:newPrice,
                    offerpercentage:body.offerpercentage,
                    enddate:body.enddate  
                }   
            }).then(async(result)=>{
                console.log(result)
              let list = await   productInfo.find({$and:[{offerprice:{$exists:true}},{category:body.categoryname}]})
            }).then((result)=>{
                console.log(result)
            })
         
        }
    }
 })
},
addCoupons:(body)=>{
    console.log(body)
    return new Promise((resolve,reject)=>{
        const coupons = new couponInfo({
            couponname:body.couponname,
            couponcode:body.couponcode,
            discount:body.coupondiscount,
            maxdiscount:body.Maxdiscount,
            maxpurchase:body.maxpurchase,
            enddate:body.enddate,
            createdAt:body.enddate,
            status:true
        })
        coupons.save((err,details)=>{
            if(err){
                console.log("error"+err)
            }else{
                
                console.log(details)
                resolve(details)
            }
        })
    })
},
findCoupons:()=>{
    return new Promise(async(resolve,reject)=>{
      await   couponInfo.find().lean().then((result)=>{
          console.log("result +++++++++++++++++++++++++++")
          console.log(result)
          resolve(result)
        })
    })
},
deleteCoupon:(couponId)=>{
    return new Promise((resolve,reject)=>{
        couponInfo.deleteOne({_id:couponId}).then((res)=>{
            console.log("delete aayo myre")
            console.log(res)
            resolve(res)
        })
    })
},
deleteOffer:(offerId)=>{
    return new Promise((resolve,reject)=>{
        productInfo.updateOne({_id:offerId},{
            $unset:{
                offerprice:1,
                offerpercentage:1,
                enddate:1
            }
        }).then((result)=>{
         
            resolve(result)
        })
    })
},
totalOrders:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find().then((result)=>{
            console.log("vaada moooooone")
            console.log(result)
           let orderCount = result.length
           console.log(orderCount)
           resolve(orderCount) 
        })
    })
},
totalSails:()=>{
    return new Promise(async(resolve,reject)=>{
       await orderInfo.find({status:'placed'}).then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
cancelledOrders:()=>{
    return new Promise(async(resolve,reject)=>{
       await orderInfo.find({status:'cancelled'}).lean().then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
totalRazorpay:()=>{
    return new Promise(async(resolve,reject)=>{
        await orderInfo.find({paymentMethod:'Razorpay'}).then((result)=>{
            console.log("++++++++++++++++++++++")
            
            console.log(result.length)
            resolve(result.length)
        })
    })
},
totalPaypal:()=>{
    return new Promise(async(resolve,reject)=>{
        await orderInfo.find({paymentMethod:'Paypal'}).then((result)=>{
            console.log("/////////////////////////////////////////")
            
            console.log(result.length)
            resolve(result.length)
        })
    })
},
totalCod:()=>{
    return new Promise(async(resolve,reject)=>{
        await orderInfo.find({paymentMethod:'COD'}).then((result)=>{
            console.log("---------------------------------")
            
            console.log(result.length)
            resolve(result.length)
        })
    })
},
placedOrder:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find({status:'placed'}).then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
deliveredOrder:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find({status:'Delivered'}).then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
cancelledOrder:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find({status:'cancelled'}).then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
shippedOrder:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find({status:'shipped'}).then((result)=>{
            console.log(result.length)
            resolve(result.length)
        })
    })
},
createAddress:(body,addressId,userId)=>{
    return new Promise((resolve,reject)=>{
        let obj={
            addressId:addressId,
            name:body.name,
            email:body.email,
            phone:body.phone,
            pincode:body.pincode,
            addressname:body.addressname,
            address:body.address
        }
        addressInfo.updateOne({userId:userId},{$push:{address:obj}},{upsert:true}).then((result)=>{
            console.log("+++++++++++++++++")
            console.log(result)
    })
    })
},
findedProduct:(proId)=>{
    return new Promise((resolve,reject)=>{
        productInfo.findOne({_id:proId}).then((result)=>{
            resolve(result)
        })
    })
},
getBuyNowProduct : (proId)=>{
  return new Promise(async(resolve,reject)=>{
     await productInfo.find({_id:proId},).lean().then((response)=>{
          resolve(response)
      })
  })
},
addToWishlist:(proId, userId)=>{
    return new Promise(async(resolve,reject)=>{
        let proObj={
            items : objectId(proId)
        }
        let userWishlist =await wishlistInfo.findOne({user:userId})
       if(userWishlist){
        let proExist = userWishlist.products.findIndex(e=> e.items==proId)
        if(proExist=-1){
            wishlistInfo.updateOne({user:userId},
                {
                    $push:{
                        products:proObj
                    }
                }).then((response)=>{
                    console.log("response;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;")
                  console.log(response) 
                    resolve(response)
                })
        }else{
            reject(false)
        }
        } else{
            const wishlist = new wishlistInfo({
                user:userId,
                products:proObj
            })
            wishlist.save((err,details)=>{
                if(err){
                    console.log("error"+err)
                }else{
                   
                    resolve(details)
                }
            })
        } 
})
       

},
getWishlistProducts:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        wishlistInfo.aggregate([
            {
                $match:{userId:userId}
            },
            {
                $unwind:'$products'
            },
           
            {
                $lookup:{
                    from:'products',
                    localField:'products.items',
                    foreignField:'_id',
                    as:'wishlistproducts'
                }
            },
            
            {$unwind:"$wishlistproducts"}
            ]).then((result)=>{
                console.log("aggregated result +++++++++++++++++++++++++++++++")
                console.log(result)
                resolve(result)
            })   
    })
},
getWishlistCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count = 0
        let cart =await wishlistInfo.findOne({user:userId})
        if(cart){
            count=cart.products.length
        }
        resolve(count)
    })
},
deleteItem:(id)=>{
    return new Promise((resolve,rejection)=>{
        let userId = id.userId
        let proId = id.proId
        wishlistInfo.updateOne({user:userId},{$pull:{products:{items:objectId(proId)}}}).then((res)=>{
            resolve(true)
        })
    })
 
},
getweeklyreport: async () => {
    const dayOfYear = (date) =>
        Math.floor(
            (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
        )
    return new Promise(async (resolve, reject) => {
       orderInfo.aggregate([
            {
                $match: {
                   status: { $ne: 'cancelled' } ,
                    date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                },
            },

            { $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } } },
        ]).then((result)=>{
        const thisday = dayOfYear(new Date())
        let salesOfLastWeekData = []
        for (let i = 0; i < 8; i++) {
            let count = result.find((d) => d._id === thisday + i - 7)

            if (count) {
                salesOfLastWeekData.push([`${i+1}`, count.count ])
            } else {
                salesOfLastWeekData.push([`${i+1}`, 0 ])
            }
        }
        console.log("result ----------------------------")
       console.log(salesOfLastWeekData)
       
        resolve(salesOfLastWeekData)
        
        })
        

    })
},
sortByDate:(body)=>{
    return new Promise((resolve,reject)=>{
        let startdate = body.startdate
        let enddate = body.enddate
        // console.log( body.enddate,body.startdate)
        console.log(body)
        orderInfo.aggregate([
            {
                $match:{
                    $and: [{ date: { $gte: new Date(startdate)  } }, { date: { $lte: new Date(enddate)  }}]
                }
            }
        ]).then((result)=>{
            resolve(result)
        })
    })
},
chooseByDate:(body)=>{
    return new Promise((resolve,reject)=>{
        console.log("-------------------------------------reult of agg  ")
        console.log(body)
        let choosedate = body.choosedate
        console.log(choosedate)
        orderInfo.aggregate([
            {
                $match:{
                    date:{$eq: new Date(choosedate)}
                }
            }
        ]).then((result)=>{
            console.log("aggggg _=-=-=-=-=---=-=-=-=-=-==-===-=-===-==-=-=")
            console.log(result)
        })
    })
},
getMonthlyReport:()=>{
    return new Promise(async(resolve, reject) =>{

        var date = new Date()
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var day = firstDay
        
        let orders = await orderInfo.find({}).lean()
        let month = []
        for(var i=0; i< orders.length; i++){

            if(orders[i].date > day){

                month.push(orders[i]);
               
            }
        }
        
        console.log(month)
        console.log("*********************month")
        resolve(month)
    })
}

}