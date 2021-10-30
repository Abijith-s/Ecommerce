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
  paymentmethod:String,
  products:Array,
  totalamount:String,
  status:String,
  date:Date,
  paymentMethod:String
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
const couponSchema = new mongoose.Schema({
    couponname:String,
    couponcode:String,
    discount:Number,
    maxdiscount:Number,
    maxpurchase:Number,
    enddate:Date,
    status:Boolean,
    createdAt: { type: Date, expires: '2m', default: Date.now }
})

//collection for coupons
const couponInfo = mongoose.model('coupons',couponSchema)
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
    manageCategories:(body)=>{
        
        console.log(body.categoryname,body.subcategory)
        return new Promise(async(resolve,reject)=>{
         let updatedCategory = await categoryInfo.updateOne({categoryname:body.categoryname},{$push:{subcategory:body.subcategoryname}}).then((response)=>{
             console.log("databasinn olla response")
             console.log(response);
         })
         
             resolve(updatedCategory)
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
      
    },findSubCategory:(cat)=>{
        return new Promise(async(resolve,reject)=>{
           await categoryInfo.find({categoryname:cat}).lean().then((response)=>{
                resolve(response)
            })
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            categoryInfo.remove({_id:id}).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteSubCategory : (id,name)=>{
        return new Promise((resolve,reject)=>{
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
    deleteItem:(id)=>{
        return new Promise((resolve,rejection)=>{
            let userId = id.userId
            let proId = id.proId
            cartInfo.updateOne({user:userId},{$pull:{products:{items:objectId(proId)}}}).then((res)=>{
               
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
placeOrder:(address,products,total,paymentMethod,userId)=>{
  
  
  
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
         cartInfo.deleteOne({user:userId}).then((res)=>{
           
             console.log(res,"++++++++++++++++++++++++++++")
         })
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
        console.log("updated status")
        console.log(response)
    })
    })
},
getAllOrders:()=>{
    return new Promise((resolve,reject)=>{
        orderInfo.find().then((res)=>{
            console.log("get all orders")
            console.log(res)
            resolve(res)
        })
    })
   
},
mangeOrder:(Id,status)=>{
    
    return new Promise(async(resolve,reject)=>{
    let orderId = objectId(Id);
     console.log("order id in mangemfjsd")
    console.log(orderId)
    console.log(status)
      await orderInfo.updateOne({_id:orderId},{$set:{status:status}}).then((response)=>{
        console.log(response)
        resolve(response)
      })
      
     
    })
   
},
addAddress:(body,userId,addressId)=>{
    console.log("ivde ondo  ")
 return new Promise(async(resolve,reject)=>{
    
     console.log("body in address")
     console.log(userId)
     console.log(body)
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
        console.log("get adress aid")
       


        console.log(userId)
        let addressId ="address.addressId"
        let singleAddress =await addressInfo.aggregate([
            {$match:{userId:userId}},
            {$unwind:"$address"},
            {$match:{[addressFeild]:aid.addressId}}
        ])
        console.log("aggregated single address")
        console.log(singleAddress)
        resolve(singleAddress[0])
        
         
    })
},
getSingleAddress:(userId,aid)=>{
    return new Promise(async(resolve,reject)=>{
        // addressID = objectId(addressId)
        let addressFeild = "address.addressId"
        
       


        console.log(userId)
        let addressId ="address.addressId"
        let singleAddress =await addressInfo.aggregate([
            {$match:{userId:userId}},
            {$unwind:"$address"},
            {$match:{[addressFeild]:aid}}
        ])
        console.log("aggregated single address")
        console.log(singleAddress)
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
    console.log(name,email,address)
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
                console.log(res)
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
    console.log(userId)
    console.log(Aid)
    return new Promise((resolve,reject)=>{
        addressInfo.updateOne({userId:userId},{$pull:{address:{addressId:Aid}}}).then((res)=>{
            console.log("response after delete")
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
compareCoupon:(body,totalAmount)=>{
   
    return new Promise(async(resolve,reject)=>{
     let couponOffer =  await couponInfo.findOne({couponcode:body.coupon}).lean()
     console.log("-----------------------------------------------------------------------")
     console.log(couponOffer)
        if(couponOffer){
         await   couponInfo.find({couponcode:body.coupon}).then((result)=>{
            
            if(totalAmount>=result[0].maxpurchase){
                let discountPrice = ((totalAmount*result[0].discount)/100)
                
                console.log(discountPrice)
                if(discountPrice<=result[0].maxdiscount){
                    totalAmount = totalAmount-discountPrice
                    
                    console.log(totalAmount)
                    resolve(totalAmount)
                }
            }else{
                reject("please purchase with maxm amount to avail offer")
            }
       
            
     })
    }else{
       
         reject("Coupon not exists")
    }   
    })
},


       

}