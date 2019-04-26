const express = require('express')
const app = express()
const crypto = require('crypto')
const os = require('os') //What is this for?
const ip = require('ip')
const events = require('events')
const electron = require('electron')
const {ipcRenderer} = electron
const hostIP = ip.address()
const port = 8080

//var  bodyParser = require("body-parser")
//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: true }))

var username
var users = []
var user = {}
var pref = {}

app.post("/registerUser", (req,res) => {
    var body = []
    
    req.on("data", (chunk) => {
        body.push(chunk)
        console.log(body)
    }).on("end", () => {
        var info = JSON.parse(Buffer.concat(body).toString())
        console.log(info)

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
    })

   /*let info = req.body

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
*/
})

app.listen(port, ip, () => {
    console.log("Connected...")
})
