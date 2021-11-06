const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { promiseImpl } = require('ejs')
const { ObjectId } = require('bson')
var objectId = mongoose.Types.ObjectId
const userSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    phone:Number,
    password:String,
    couponhistory:Array,
    status:Boolean
})
const userInfo = mongoose.model('users',userSchema)

const couponInfo = require("./couponSchema")


module.exports={
    addUsers : (users)=>{
        console.log("users")
        console.log(users)
        return new Promise(async(resolve,reject)=>{
            users.password =await bcrypt.hash(users.password,10)
            const userRegister = new userInfo({
                firstname : users.firstname,
                lastname : users.lastname,
                email : users.email,
                phone: users.phone,
                password : users.password,
                
                status:true
            })
            userRegister.save((err,details)=>{
                if(err){
                    console.log("error"+err);
                }else{
                    console.log("evdenn vannu")
                    console.log(resolve);
                resolve(details)
                }
            })
        })
        
        
       
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            console.log("ivde ethyoo")
            let users =await  userInfo.find().lean()
            console.log(users)
            resolve(users)
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response ={}
            let status = true
            let user =await userInfo.findOne({email:userData.email})
            console.log("userssssssssssss")
            console.log(user)
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user = user;
                        response.status = true;
                        console.log("responsesssssssssssssssssssssssssss")
                        console.log(response)
                        resolve(response)
                    }else{
                       console.log("wrong passwordddd")
                        resolve({status:false})
                    }
                })
            }else{
               
                resolve(status=false)
            }
        })
    },
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           await userInfo.updateOne({_id:userId},{$set:{status:false}}).then((response)=>{
                console.log('ivde ethyarnno');
                console.log(response)
                resolve(response)
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           await userInfo.updateOne({_id:userId},{$set:{status:true}}).then((response)=>{
                resolve(response)
            })
        })
    },
    findUser:(phone)=>{
        console.log(phone)
       let  number = phone.phone
       console.log(number)
        return new Promise((resolve,reject)=>{
            userInfo.findOne({phone:number}).then((result)=>{
                console.log("user for otp")
                console.log(result)
                resolve(result)
            })
        })
    },
    findBlockedUsers:(email)=>{
        return new Promise((resolve,reject)=>{
            console.log(email)
            userInfo.findOne({email:email},{_id:0,status:1}).then((res)=>{
                console.log(res)
                resolve(res)
            })
        })
       
    },
        getUserBymail:(email)=>{
        
        return new Promise((resolve,reject)=>{
            userInfo.findOne({email:email}).then((response)=>{
              console.log('userResponse:', response);
              resolve(response)
            })
          })
    },
    addGoogleUser:(email,username)=>{
        console.log("ivd ebammo")
     return new Promise((resolve,reject)=>{
        const userRegister = new userInfo({
            firstname : username.firstname,
            email : users.email,
        })
        userRegister.save((err,details)=>{
            if(err){
                console.log("error"+err);
            }else{
                console.log("evdenn vannu")
                console.log(resolve);
            resolve(details)
            }
        })
     }).then((response)=>{
       userInfo.findOne({_id:response.insertedId}).then((response)=>{
        console.log(response)   
        resolve(response)
       })
     })
  },
  findUser:(phone)=>{
      console.log("user id 66666666666666666666")
      console.log(phone.phone)
    return new Promise(async(resolve,reject)=>{
     await  userInfo.findOne({phone:phone.phone}).then((res)=>{
         if(res){
            console.log(res+"++++++++++++++++++++++++++++++++++++++++++++++++++")
            resolve(res)
         }else{
             resolve(false)
         }
        
     })
     
    })
  },
  editProfile:(body,user)=>{
      
      console.log("whole body")
      console.log(user)
      console.log(body.firstname,body.lastname,body.phone,body.email)
     
      let userId = objectId(body.userId)
      return new Promise(async(resolve,reject)=>{
       
            await  userInfo.updateOne({_id:user._id},{$set:{
                firstname:body.firstname,
                lastname:body.lastname,
                phone:body.phone,
                email:body.email,
                status:true
             }}).then(async(res)=>{
                
                 let newUser= await userInfo.findOne({_id:ObjectId(user._id)})
                 console.log("new user varuvanel vaa enik orakam varanu")
                 console.log(newUser)
                 resolve(newUser)
             })
         })
      
  },
  changePassword:(body,user)=>{
    return new Promise(async(resolve,reject)=>{
        console.log("-----------------------------")
           console.log(body.oldpassword)
         console.log(user)
         let currentPassword = body.oldpassword
         let userPassword = user.password
        
         let newPassword = body.newpassword
        
         let newOne =await bcrypt.compare(currentPassword,userPassword)
         console.log("+++++++++++++++++++++++")
         console.log(newOne)
             if(newOne){
                changedPassword = await bcrypt.hash(newPassword,10)
                
             
             console.log("checking status of password")
             console.log(changedPassword)
             await userInfo.updateOne({_id:user._id},
                {
                    $set:{
                        password:changedPassword
                    }
                }).then((res)=>{
                  
                    resolve(true)
                })
            }else{
                resolve(false)
            }
    })
  },
  markCoupon:(userId,couponId)=>{
    
      return new Promise((resolve,reject)=>{
        userInfo.updateOne({_id:userId},{
            $push:{
                couponhistory:couponId
            }
        }).then((result)=>{
            console.log("-------------------------------------");
            console.log(result)
      })
      })
   
},
compareCoupon:(body,totalAmount,userId)=>{
  
   let couponId = body.coupon
    return new Promise(async(resolve,reject)=>{
    let couponExist = await userInfo.findOne({$and:[{_id:userId},{couponhistory:couponId}]})
        console.log(couponExist)
    if(!couponExist){
        let couponOffer =  await couponInfo.findOne({couponcode:couponId}).lean()

        if(couponOffer){
         await   couponInfo.find({couponcode:couponId}).then((result)=>{
            
            if(totalAmount>=result[0].maxpurchase){
                let discountPrice = ((totalAmount*result[0].discount)/100)
                
                console.log(discountPrice)
                if(discountPrice<=result[0].maxdiscount){
                    totalAmount = totalAmount-discountPrice
                    
                    console.log(totalAmount)
                    resolve(totalAmount)
                }
            }else{
                reject("please purchase with maximum amount to enjoy your offer")
            }
       
            
     })
    }else{
       
         reject("Coupon not exists")
    }
    }else{
        reject("coupon already used")
    }
        
    })
},
totalCustomers:()=>{
    return new Promise(async(resolve,reject)=>{
      await  userInfo.find().then((result)=>{
          console.log(result.length)
          resolve(result.length)
      })
    })
},
getUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        userInfo.findOne({_id:userId}).then((result)=>{
            console.log(result)
            resolve(result) 
        })
    })
},
findOneUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        userInfo.findOne({_id:userId}).then((res)=>{
            resolve(res)
        })
    })
}

}