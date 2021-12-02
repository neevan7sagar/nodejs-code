const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const port = 3000;

var mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()
var StudentModel = require('./studentschema')
app.use(bodyParser.json())
// app.use(bodyParser.urlencodedY({extended:true}))

var query = "mongodb+srv://admin:admin@cluster0.b9pn7.mongodb.net/mydatabase?retryWrites=true&w=majority"
mongoose.connect(query,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log("Connection successful")
}).catch(err => {
    console.log("Error", err)
    process.exit()
})

app.post('/create',async (req,res) => {
const salt = await bcrypt.genSalt(10)
req.body.password = await bcrypt.hash(req.body.password,salt)
    StudentModel.create(req.body).then(user => {
            res.send(user)
        }).catch(err => {
            console.log(err)
        })
        // var newStudent = new StudentModel();
        // newStudent.Name = req.body.Name;
        // newStudent.Id = req.body.Id;
        // newStudent.Birthday = req.body.Birthday;
        // newStudent.Address = req.body.Address;
        // newStudent.save((err,data)=>{
        //     if(err){
        //         console.log(error)
        //     }
        //     else{
        //        res.send ("Data inserted")
        //     }
        // })
    })
    app.delete('/delete',(req,res)=>{
        StudentModel.remove({Name:"sarvesh"},(err,data)=>{
            if(err){
                console.log(error)
            }
            else{
                res.send(data)
            }
        })
    })
    app.put("/update",(req,res)=>{
        StudentModel.findByIdAndUpdate(req.body.id, {Name:req.body.Name},(err,data)=>{
            if(err){
                console.log(err)
            }
            else{
                res.send(data)
            }
        })
    })

    app.post("/login",async (req,res)=>{
       const user = await StudentModel.findOne({Email:req.body.Email})
       if(user){
        const validatePassword = await bcrypt.compare(req.body.password, user.password)
        if(validatePassword){
            const token = jwt.sign({email:user.Email},process.env.ACCESS_TOKEN_SECRET,{"expiresIn":"15m"})
            res.send({message:"success",token:token})
        } else{
            res.send("Password is incorrect")
        }
       }else{
           // token generated with jwt.sign method
           res.send("User not found")
       }
    })
    // app.use()
    const ChekUrl = (req,res,next)=>{
        // verify token here
        const header = req.headers.authorization
        const token = header && header.split(' ')[1]
        console.log(token)
        if(token == null) return res.send("Token not found")
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,verifiedJwt)=>{
            if(err) return res.send("Token is expired or it is incorrect")
            next();
            }
        )
    }
    app.use(ChekUrl);
    app.get('/',(req,res)=>{
        // StudentModel.findOne({Name:req.params.name},function(err, data) for one 
        StudentModel.find(function(err, data)
         {
            if(err){
                console.log(err);
            }
            else{
                res.send(data);
            }
        })
    })


// const bcrypt = require('bcrypt')
const securePassword = async(password)=>{
const passwordHash = await bcrypt.hash(password,10)
console.log(passwordHash)
// const passwordHash = await bcrypt.compare(password,10)
const passwordMatch = await bcrypt.compare(password,passwordHash)
// const passwordMatch = await bcrypt.compare('naveen@123',passwordHash) true
// const passwordMatch = await bcrypt.compare('naveen@13',passwordHash) //false

console.log(passwordMatch)
} 
securePassword("naveen@123")
// $2b$10$QEyYsSfxS6X/BYr6.n5um.t3i61JLGfMbLjqtv4rB.j1mTNi0wIUW




app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})