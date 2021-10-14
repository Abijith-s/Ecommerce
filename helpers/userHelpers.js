const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    password:String,
    status:Boolean
})
const userInfo = mongoose.model('users',userSchema)
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
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    }else{
                       
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
    }
}