var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");
require("firebase/firestore");
// var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt-nodejs');
// var yelp = require('yelp-fusion');

// setup connection to firebase database
const firebaseConfig = {
    apiKey: "AIzaSyCvKLDrNaPfCcEIlvddM4MWXFSbTs4SmT0",
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
// let smtpTransport = nodemailer.createTransport({
//   host: "smtp-mail.outlook.com", // hostname
//   secureConnection: false, // TLS requires secureConnection to be false
//   port: 587, // port for secure SMTP
//   tls: {
//     ciphers:'SSLv3'
//   },
//   auth: {
//     user: 'register@pvnet.com',
//     pass: 'R3gi$t3r'
//   }
// });

/* converts to a regular date */
function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
    return [ date.getFullYear(), mnth, day ].join("-");
}

/* GET index page. */
router.get('/', function(req, res, next) {
    var cafes = [];
    // Create a promise for the cafes
    const cafePromise = new Promise((res, rej) => {
        // called the table database
        db.collection('cafes').get()
            .then((snapshot) => {
                // loop through each document in the database
                snapshot.docs.forEach(doc => {
                    // grab the data and push it to a list
                    var details = {
                        id: doc.id,
                        name: doc.data().name,
                        city: doc.data().city
                    };
                    cafes.push(details);
                });
                // resolve the details of cafes
                res(cafes);
            });
    })
        .then(cafeList => {
            var buffer = "cafes";
            res.render('index', { title: 'Express' , data: buffer, cafeList});
        });
});

/* GET home page. */
router.get('/home', function(req,res) {
  res.render('defaultPage', { title: 'Default' })
});

/* GET login page */
router.get('/login', function(req,res) {
  res.render('signInPage', { title: 'Sign In' });
});

/* GET sign up page */
router.get('/register', function(req,res) {
  res.render('signUpPage', { title: 'Sign Up'});
});

/* GET about us page */
router.get('/aboutUs', function(req,res) {
  res.render('UserManual', { title: 'AboutUs' });
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
    var userDataPacket = {

        email: data[0].email,
        pass: data[0].password,
        firstName: data[0].firstname,
        lastName: data[0].lastname,
        useID: data[0].id
    };
    if (req.cookies.userInfo == null) { // make cookie
        res.cookie("userInfo", userDataPacket);

        console.log("here is the coockie", req.cookies);
    }
});

/* POST yelp search */
// router.post('/yelpSearch', function(req,res) {
//   var info = req.body;
//
// });

module.exports = router;
