'use strict';

var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");
var yelp = require('yelp-fusion');
var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt-nodejs');
const client = yelp.client(API);
require("firebase/firestore");
// const googleMapsClient = require('@google/maps').createClient({
//     key: 'AIzaSyApKBreU4wt1M8_x0wa5wHmYCt5MNHMum4'
// });

// Global variables
var host, mailOptions,link, buffer = "", usersDataPack = {};

// setup connection to firebase database
const firebaseConfig = {
    apiKey: API,
    authDomain: "lets-eat-18b7b.firebaseapp.com",
    databaseURL: "https://lets-eat-18b7b.firebaseio.com",
    projectId: "lets-eat-18b7b",
    storageBucket: "lets-eat-18b7b.appspot.com",
    messagingSenderId: "852218951035",
    appId: "1:852218951035:web:f66d1e057e50f8d4"
};
firebase.initializeApp(firebaseConfig);
// Create the database connection
const db = firebase.firestore();

// Sending emails to the user
let smtpTransport = nodemailer.createTransport({
  host: "smtp.gmail.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers:'SSLv3'
  },
  auth: {
    user: 'letseatsc@gmail.com',
    pass: 'Aaqwertyuiop1'
  }
});

/* converts to a regular date */
function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
    return [ date.getFullYear(), mnth, day ].join("-");
}

/* GET index page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' , data: buffer});
});

/* GET home page. */
router.get('/home', function(req,res) {
  res.render('defaultPage', { title: 'Default' })
});

/* GET login page */
router.get('/login', function(req,res) {
    var buffer = "";
    var text = "";
  res.render('signInPage', { title: 'Sign In' , data: buffer, text});
});

/* GET sign up page */
router.get('/register', function(req,res) {
  res.render('signUpPage', { title: 'Sign Up'});
});

/* GET about us page */
router.get('/aboutUs', function(req,res) {
  res.render('UserManual', { title: 'AboutUs' });
});

/* GET help page */
router.get('/help', function(req,res) {
    res.render('helpPage', {title: 'Help Page'});
});

router.get('/accountInterface', function(req, res) {
    if (req.cookies.userInfo!=null) {
        var email = req.cookies.userInfo.email;
        var userPacket = req.cookies.userInfo;

        db.collection('users')
    }
});

/* POST restaurant search */
router.post('/restaurantSearch', function(req,res) {
    var searchTerm = req.body.term;
    var location = req.body.location;

    var restaurants = [];

    client.search({
        term: searchTerm,
        location: location,
    })
        .then(response => {

            restaurants = response.jsonBody.businesses;
            console.log(restaurants);
            var title = "searching for... ";

            res.render('yelpSearchPage', {title: title, data: buffer, restaurants, searchTerm, location});

        })
        .catch(e => {
            console.log(e);
        });
});

/* GET check username */
router.get('/isUnique', function(req, res) {
    var query = require('url').parse(req.url, true).query;
    var username = query.uname;
    var inUse = false;
    const promise = new Promise((res,rej) => {
        db.collection('users').where('username', '==', username).get()
            .then((snapshot) => {
                if (snapshot != null) {
                    snapshot.docs.forEach(doc => {
                        if (doc.data().username === username) {
                            inUse = true;
                        }
                    });
                }
                res(inUse)
            });
    })
        .then(nameInUse => {
            return res.send({
                UserNameInUse: nameInUse
            });
        });
});

/* GET check email*/
router.get('/checkEmail', function(req, res) {
    var query = require('url').parse(req.url, true).query;
    var email = query.email;
    var inUse = false;
    const promise = new Promise((res,rej) => {
        db.collection('users').where('email', '==', email).get()
            .then((snapshot) => {
                if (snapshot != null) {
                    snapshot.docs.forEach(doc => {
                        if (doc.data().email === email) {
                            inUse = true;
                        }
                    });
                }
                res(inUse)
            });
    })
        .then(emailInUse => {
            return res.send({
                EmailInUse: emailInUse
            });
        });
});

/* POST registering users */
router.post('/registerUser', function(req,res) {
    // Personal information
    var un = req.body.Username;
    var email = req.body.Email;
    var pass = req.body.Password;
    var fn = req.body.FirstName;
    var ln = req.body.LastName;
    var dob = req.body.dob;
    var city = req.body.City;
    var state = req.body.State;
    var phone = req.body.phone;
    var secq = req.body.SecurityQuestion;
    var seca = req.body.Answer;
    var zip = req.body.zip;

    // Preferences
    var  am = !!req.body.American;
    var me = !!req.body.Mexican;
    var ch = !!req.body.Chinese;
    var ja = !!req.body.Japanese;
    var th = !!req.body.Thai;
    var it = !!req.body.Italian;
    var ind = !!req.body.Indian;
    var gr = !!req.body.Greek;

    var prefs = {
        American: am,
        Chinese: ch,
        Greek: gr,
        Indian: ind,
        Italian: it,
        Japanese: ja,
        Mexican: me,
        Thai: th,
        username: un,
    };

    var userInfo = {
        username: un,
        email: email,
        password: bcrypt.hashSync(pass, null, null),
        firstname: fn,
        lastname: ln,
        dateofbirth: dob,
        city: city,
        state: state,
        zipcode: zip,
        phone: phone,
        securityquestion: secq,
        securityanswer: seca,
        verified: false,
    };
        db.collection('users').add(
            userInfo
        )
            .then(function (docRef) {
                console.log("Document written with users ID: ", docRef.id);
                db.collection('preferences').add(
                    prefs
                )
                    .then(function (docRef2) {
                        console.log("Document written with preferences ID: ", docRef2.id);
                        host = req.get('host');
                        link = "http://" + req.get('host') + '/verify?id=' + userInfo.password;
                        mailOptions = {
                            to: email,
                            subject: "Let's Eat! Please Confirm Your Email Account",
                            html: "Hello! <br> To continue on to deliciousness, please verify your email by clicking on the link in the email.<br><a href=" + link + ">Click here to verify</a>"
                        };

                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                console.log("Message sent: " + response.message);
                                res.redirect('/home');
                            }
                        })
                    })
                    .catch(function (error) {
                        console.log("Error adding preferences document: ", error);
                    });
            })
            .catch(function (error) {
                console.log("Error adding users document: ", error);
            });
});

/* GET verify account */
router.get('/verify', function(req,res){
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        const verifyPromise = new Promise((res, rej) => {
            db.collection('users').get()
                .then((snapshot) => {
                    var theName;
                    // loop through each document in the database
                    snapshot.docs.forEach(doc => {
                        // grab the data and push it to a list
                        if (doc.data().password === req.query.id) {
                            theName = doc.data().firstname;
                            var docId = doc.id;

                            db.collection('users').doc(docId).update({
                                verified: true,
                            });
                            console.log(theName);
                            res(theName);
                        }
                    });

                });
        })
            .then(fName => {
                console.log(fName);
                // res.redirect('/login');
                res.render('RegisteredNotification', {title: "Success!", data: buffer, fName});
            })
            .catch(err => {
               console.log(err);
            });
    } else {
        res.end("<h1>Request id from unknown source</h1>");
    }
});

/* Post request to sign in */
router.post('/signIn', function(req,res) {
    var email = req.body.email;
    var password = req.body.pass;

    let query = db.collection('users').where('email', '==', email).get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log("No matching documents.");
                var text = "Email or Password is wrong.";
                res.render('signInPage',{title:"login", data:buffer, text});
            }
            else {
                if(snapshot[0].data().verified == false) {
                    res.render("accountFoundButNotVerified", {title: "Please verify your email"});
                }
                else {
                    if(bcrypt.compareSync(password,snapshot[0].data().password)) {
                        var userDataPack = {
                            email: snapshot[0].data().email,
                            pass: snapshot[0].data().password,
                            firstName: snapshot[0].data().firstname,
                            lastName: snapshot[0].data().lastname,
                            username: snapshot[0].data().username,
                            docID: snapshot[0].id
                        };
                        if (req.cookies.userInfo == null) {
                            res.cookie("userInfo", userDataPack, {expire: new Date() + 1});
                            console.log("here is the cookie", req.cookies);
                            res.redirect("/accountInterface");
                        }
                    }
                    else {
                        var text = "Username or Password is wrong";
                        res.render('signInPage', {title: "login", data: buffer, text});
                    }
                }
            }
        })
        .catch(err => {
            console.log("Error getting documents", err);
        });
});

module.exports = router;