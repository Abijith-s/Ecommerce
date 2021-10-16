const mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt')

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
            console.log("useer id inside useercart");
            console.log(userId)
            if(userCart){
                let proExist = userCart.products.findIndex(e=> e.items==proId)
                console.log("proExist  in cart")
                console.log(proExist)
                if(proExist!=-1){
                    cartInfo.updateOne({user:userId,'products.items':objectId(proId)},{$inc:{'products.$.quantity':1}}).then((res)=>{
                        console.log("reponse of quantity")
                        console.log(res)
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
        console.log("userId in cart count")
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart =await cartInfo.findOne({user:userId})
            if(cart){
                count=cart.products.length
            }
            console.log("count inside cart")
            console.log(count);
            resolve(count)
        })
    },
    changeQuantity:(body)=>{
        count= parseInt(body.count)
        return new Promise((resolve,reject)=>{
            if(proExist!=-1){
                cartInfo.updateOne({_id:body.cartId,'products.items':objectId(proId)},{$inc:{'products.$.quantity':count}}).then((res)=>{
                    console.log("reponse of quantity")
                    console.log(res)
                   resolve(res)

                })
        }})
    }


}