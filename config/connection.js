const mongoose = require('mongoose');
module.exports.connect =  function(done){
    mongoose.connect('mongodb://localhost:27017/shopping',(err,data)=>{
        if(err){
            return done(err)
        }else {
            return done()
        }
    })  
}