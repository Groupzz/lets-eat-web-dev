const express = require('express')
const app = express()
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = require('./db/user')

var  bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/letseat", { useNewURLParser: true })

const ip = '104.237.158.50'
const port = 8080
var username
var user = {}
var pref = {}

app.post("/registerUser", (req,res) => {
    console.log(req.body)
    
//   var key = Object.keys(req.body)
//   console.log(typeof req.body)
//   var info = JSON.parse(key)
//   console.log(info)

   let info = req.body

   username = info.Username
   var pw = info.Password
  
  //Create a salt and a salted hash
   const salt = crypto.randomBytes(16)
   const shash = crypto.createHash('sha256').update(salt + pw).digest()
   var user = {
       userName: username,
       salt: salt,
       shash: shash,
       firstName: info.FirstName,
       lastName: info.LastName,
       email: info.Email,
       city: info.City,
       state: info.State,
       sQuestion: info.SecurityQuestion,
       sAnswer: info.Answer
   }
   console.log(user)

   var newUser = new User(user)

   newUser.save()
        .then(item => {
            console.log("item saved to database")
            //Look up electron for going to html page and error message
            res.end()
        })
        .catch(err => {
            console.log("unable to save to database")
            res.writeHead(469, "Username/email taken")
            res.end()
        })

})

app.listen(port, ip, () => {
    console.log("Connected...")
})
