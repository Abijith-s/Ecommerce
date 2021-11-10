const mongoose = require('mongoose');
module.exports.connect =  function(done){
    mongoose.connect('mongodb+srv://Abijith:abijith@cluster0.bxhxv.mongodb.net/shopping?retryWrites=true&w=majority',(err,data)=>{
        if(err){
            return done(err)
        }else {
            return done()
        }
    })  
}