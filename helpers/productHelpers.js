const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId
 const Razorpay = require('razorpay')
const bcrypt = require('bcrypt')
const { response } = require('express')
var instance = new Razorpay({
    key_id: 'rzp_test_LqsPiBnf3p2Kjm',
    key_secret: 'gj980xGE40154zsn2DvdGqUI',
  });
// schema for product collection
const productSchema = new mongoose.Schema({
    productname:String,
    description:String,
    price:Number,
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
                {
                    $group:{
                        _id:null,
                     total:{
                       $sum:{$multiply:['$products.quantity','$cartproducts.price']}  
                     }
                    }
                }
                ]).then((result)=>{
                   
                    resolve(result)
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
    console.log("userid")
    console.log(userId)
    return new Promise((resolve,reject)=>{
        cartInfo.findOne({user:userId}).then((res)=>{
            resolve(res)
        })
     
    })
},
placeOrder:(address,products,total,paymentMethod,userId)=>{
  let totalAmount = total[0].total
  console.log("body in radio button")
   console.log(totalAmount)
   console.log(products)
    return new Promise((resolve,reject)=>{
        
        let  status = 'placed';
        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds() 
        
      
         const orders = new orderInfo({
        
         userId:userId,
         deliverydetails:address,
         products:[...products.products],
         totalamount:totalAmount,  
         status:status,
         date:formatted_date,
         paymentMethod:paymentMethod
        
        })
        orders.save((err,details)=>{
            if(err){
             console.log("error"+err)
            }else{
                console.log("placed orders")
                console.log(details)
                console.log("inserted value")
                console.log(details._id)
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
         console.log("orde list")
        console.log(res)
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
         pincode:body.pincode,
         addressname:body.addressname,
         address:body.address,
        
     }
     addressInfo.updateOne({userId:userId},{$push:{address:addressObj}},{upsert:true}).then((result)=>{
         console.log(result)
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
        console.log("result of aggregation")
        console.log(res)
        resolve(res)
    })
    
   
})
},
getAddress:(userId,addressId)=>{
    return new Promise(async(resolve,reject)=>{
        // addressID = objectId(addressId)
        let addressFeild = "address.addressId"
        console.log(addressId)
      let findedAddress = await addressInfo.aggregate([
        {$match:{userId:userId}},
         {$unwind:"$address"},
        {$match:{[addressFeild]:addressId}}
        ])
        console.log("finded adress")
        console.log(findedAddress)
        resolve(findedAddress)
    })
},
// editAddress:(body)=>{
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
deleteAdress:(userId,addressId)=>{
    console.log(userId)
    console.log(addressId)
    return new Promise((resolve,reject)=>{
        addressInfo.updateOne({userId:userId},{$pull:{address:{addressId:addressId}}}).then((res)=>{
            console.log("response after delete")
            resolve(res)
        })
    })
    
},
generateRazorPay:(orderID,total)=>{
  console.log("razorpay")
    return new Promise((resolve,reject)=>{
        let orderId = ""+orderID+""
        let totalAmount = total[0].total
        console.log(totalAmount)
        var options = {
            amount: totalAmount*100,  // amount in the smallest currency unit
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
    console.log("orderId in change")
    console.log(orderId)
    return new Promise((resolve,reject)=>{
        orderInfo.updateOne({_id:orderId},{$set:{status:'placed'}}).then((res)=>{
            console.log("updated status")
            console.log(res)
            resolve(res)
        })
    })
}
       

}