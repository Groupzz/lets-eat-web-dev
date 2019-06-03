const express = require('express')
const app = express()
const session = require('express-session')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = require('./db/user')
//const yelpsearch = require('./yelp.js')

const ip = '104.237.158.50'//'localhost' //'104.237.158.50'
const port = 8080

var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./public'))
app.use(cookieParser())

//Initialize express-session to allow us to track the logged in user across
//sessions
app.use(session({
    key: 'user_sid',
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

//This middleware will check if user's cookie is still saved in browser and
//user is not set, then automatically log the user out. Usually happens when
//we stop the express server after login, the cookie still remains saved in 
//the browser
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid')
    }
    next()
})

//Middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/userPage')
    } else {
        next()
    }
}

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/letseat", { useNewURLParser: true })

var username
var users = []
var user = {}
var pref = {}

var api_key = 'p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx';

//Route for home page
app.get('/', sessionChecker, (req, res) => {
    res.sendFile(__dirname+'/public/index.html')
})

//Registers user
app.post("/yelpSearch", (req,res) => {
  console.log(req.body)

  let info = req.body

  var search = info.place
  var location = info.location

  yelpsearch.yelpSearch(search, location)
})

//Route for registerUser page
app.route('/registerUser')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname+'/public/signUpPage.html')
    })
    .post((req,res) => {

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
                res.redirect('/signIn')
            })
            .catch(err => {
                console.log("unable to save to database")
                res.writeHead(469, "Username/email taken")
                res.redirect('/registerUser')
            })
    })

//Route for signIn page
app.route('/signIn')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname+'/public/signInPage.html')
    })
    .post((req,res) => {
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
                res.sendFile(__dirname+'/public/defaultPage.html')
            }
            else {
                console.log("Wrong password")
                res.redirect('/signIn')
            }
        })
    })

//app.get('/userPage', (req, res) =>

app.listen(port, ip, () => {
    console.log("Connected...")
})

function getInfoByEmail(email) {
    var info = User.findOne({email: email}, 'salt shash')
    return info
}
