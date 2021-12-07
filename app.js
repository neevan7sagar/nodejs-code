const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const schemamodel = require('./appschema')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const { schema } = require('./appschema');
const nodemailer = require('nodemailer')
var path=require('path')
const port = 3000
require('dotenv').config()

app.use(bodyParser.json())

// var randtoken = require('rand-token')


const query = "mongodb+srv://admin:admin@cluster0.b9pn7.mongodb.net/mydatabase?retryWrites=true&w=majority"
mongoose.connect(query, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection successful")
}).catch(err => {
    console.log("Error", err)
})

app.post('/register',async (req,res) => {
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password,salt)
        schemamodel.create(req.body).then(user => {
            const token = jwt.sign({email:user.email},process.env.ACCESS_TOKEN_SECRET,{"expiresIn":"1d"})
            const link = 'http://localhost:3000/account/activation/'+token
    var transporter = nodemailer.createTransport({
        service:"gmail",
        secure:false,
        port:587,
        auth: {
          user: process.env.useremail,
          pass: process.env.userpassword
        },
        tls: {rejectUnauthorized: false}
      });
    const mailData = {
        from :process.env.useremail,
        to:user.email,
        subject:"Account Activation",
        text:link
    };
    transporter.sendMail(mailData,(error,info)=>{
        if(error){
             console.log(error)
        }
        else{
            console.log(info.response)
            res.send("One confirmation email has been sent to your email address so You need to confirm your email for account activation")
            }
        })
    })
})


app.get('/account/activation/:token',async(req,res) => {
     const vToken = req.params.token
     jwt.verify(vToken,process.env.ACCESS_TOKEN_SECRET, async (err,payload)=>{
        if(err) return res.status(401).send({code:401,message:"faliure",error:"Token is incroorec or it is expired"})
        const user = await schemamodel.findOne({email:payload.email})
        user.isActive = true
        user.save().then((success)=>{
            res.status(200).send({code:200,message:"success",result:"Your account has been activated successfully"})
        }).catch((err)=>{res.json(err)})
     })
})

app.post("/login",async (req,res)=>{
    const user = await schemamodel.findOne({email:req.body.email})
    if(user){
        if(user.isActive){
     const validatePassword = await bcrypt.compare(req.body.password, user.password)
     if(validatePassword){
         const token = jwt.sign({email:user.email},process.env.ACCESS_TOKEN_SECRET,{"expiresIn":"15m"})
         const refreshtoken = jwt.sign({email:user.email},process.env.REFRESH_TOKEN_SECRET,{"expiresIn":"30m"})
         res.send({message:"token has been Generate Successfully",token:token,refreshToken:refreshtoken})
     } else{
         res.send("Password is incorrect")
     }
    } else {
        res.send("Your account is not activated yet.")
    }
    }else{
        res.send("User not found")
    }
 })

 app.post('/refreshtoken',(req,res)=>{
    const refreshToken = req.body.refreshToken
    if(refreshToken == null) return res.status(401).send("Token not found")
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if(err) return res.status(401).send("Token is incorrect or it is expired")
        const accessToken = generateAccessToken({email:req.body.email})
        const refreshtoken = jwt.sign({email:user.email},process.env.REFRESH_TOKEN_SECRET,{"expiresIn":"30m"})
        res.send({accessToken:accessToken,refreshToken:refreshtoken})
    })
})
function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{"expiresIn":"15m"})
}
 //we want to verify token
 const chektoken = (req,res,next)=>{
     //here is token
     const header = req.headers.authorization
     const token = header && header.split(' ')[1]
     console.log(token)
     if(token == null) return res.send('token not found')
     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,verifiedJwt)=>{
         if(err)return res.send("token is expired or it may be incorrect")
         next();
     })
 }
 app.use(chektoken);
 app.get('/',(req,res)=>{
     schemamodel.find((err,data)=>{
         if(err){
             console.log(err)
         }
         else{
             res.send(data)
         }

     })
 })

app.listen(port, () => {
    console.log(`server is ready on ${port}`)
})