const mongoose = require("mongoose")
 
const couponSchema= new mongoose.Schema({
    couponname:String,
    couponcode:String,
    discount:Number,
    maxdiscount:Number,
    maxpurchase:Number,
    enddate:Date,
    status:Boolean,
    createdAt: { type: Date, expires: '2m', default: Date.now }
})

module.exports = mongoose.model('coupons',couponSchema)