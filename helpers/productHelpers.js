const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
const catergorySchema = new mongoose.Schema({
    categoryname:String,
    subcategory:Array
})
const categoryInfo = mongoose.model('category',catergorySchema)

    
   

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
        console.log("categoryname")
        console.log(categoryname);
        return new Promise((resolve,reject)=>{
          let cate =  productInfo.find({category:categoryname}).lean()
          console.log(cate);
          resolve(cate)
        })
    }
    
}