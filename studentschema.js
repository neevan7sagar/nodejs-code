const mongoose = require('mongoose');
var StudentSchema= new mongoose.Schema({
    Name:String,
    Id:Number,
    Birthday:Date,
    Address:String,
    Email:String,
    password:String
    
});

// StudentSchema.pre("save",async function(next,){
//     // const passwordHash = await bcrypt.hash(password,10)
//     console.log(`the current password is ${this.password}`);
// t
//     // next()

// })
module.exports = mongoose.model('student',StudentSchema)