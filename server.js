const express = require('express')
const app = express()
const crypto = require('crypto')
const mongoose = require('mongoose')

var  bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = global.Promise

const port = 8080
var name
var user = {}
var pref = {}

app/post("/registerUser", (req,res) => {
    name = info.FirstName + " " + info.LastName
    var pw = info.Password
   
   //Create a salt and a salted hash
    const salt = crypto.randomBytes(16)
    const shash = crypto.createHash('sha256').update(salt + pw).digest()
    var user = {
        userName: info.Username,
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

