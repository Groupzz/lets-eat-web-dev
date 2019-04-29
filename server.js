const express = require('express')
const app = express()
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = require('./db/user')

const ip = '104.237.158.50'
const port = 8080

var  bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./public'))

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/letseat", { useNewURLParser: true })

var username
var users = []
var user = {}
var pref = {}

//Registers user
app.post("/registerUser", (req,res) => {

   let info = req.body

   var un = info.Username
   var pw = info.Password
  
  //Create a salt and a salted hash
   const salt = crypto.randomBytes(16)
   const shash = crypto.createHash('sha256').update(salt + pw).digest()
   var user = {
       userName: un,
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
            res.sendFile('public/signInPage.html')
        })
        .catch(err => {
            console.log("unable to save to database")
            res.writeHead(469, "Username/email taken")
            res.end()
        })
})

//Logs user into their account
app.post("/signIn", (req,res) => {
    //Get the passed through values
    let creds = req.body
    var email = creds.email
    var pw = creds.password
    

    //Finds the email in the user database and get the stored salt and hash
    var info = getInfoByEmail(email)
    info.exec((err,user) => {
        if(err)
            return console.log(err)
        let salt = user.salt
        let storedShash = user.shash


        //Make a new hash based on the salt and password 
        var shashComputed = crypto.createHash('sha256').update(salt + pw).digest()
        //If the new hash matches the stored hash, go to userPage
        if (Buffer.compare(shashComputed, storedShash) == 0) {
            res.sendFile(__dirname+'/public/userPage.html')
        }
        else {
            console.log("Wrong password")
            res.end()
        }
    })
})

app.listen(port, ip, () => {
    console.log("Connected...")
})

function getInfoByEmail(email) {
    var info = User.findOne({email: email}, 'salt shash')
    return info
}
