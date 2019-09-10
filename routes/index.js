var express = require('express');
var router = express.Router();
// var nodemailer = require("nodemailer");
// var bcrypt = require('bcrypt-nodejs');
// var yelp = require('yelp-fusion');
var admin = require("firebase-admin");
var functions = require('firebase-functions');

var serviceAccount = require(".\\serviceAccountKey.json");

admin.initializeApp(
    // credential: firebase.credential.cert(serviceAccount),
    // databaseURL: "https://lets-eat-18b7b.firebaseio.com"
    functions.config().firebase
);
var db = admin.firestore();
// users - city, dateofbirth, email, firstname, lastname, password, phone, securityanswer, securityquestion, state, username, zipcode
// preferences - username, preference
// statusboard - checkin, username

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
// var firebase = require("firebase/app");
// //
// // Add the Firebase products that you want to use
// require("firebase/auth");
// require("firebase/firestore");
// const firebaseConfig = {
//     apiKey: "AIzaSyCvKLDrNaPfCcEIlvddM4MWXFSbTs4SmT0",
//     authDomain: "lets-eat-18b7b.firebaseapp.com",
//     databaseURL: "https://lets-eat-18b7b.firebaseio.com",
//     projectId: "lets-eat-18b7b",
//     storageBucket: "lets-eat-18b7b.appspot.com",
//     messagingSenderId: "852218951035",
//     appId: "1:852218951035:web:f66d1e057e50f8d4"
// };
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
function getUsername() {
    var docRef = db.collection("testing").document("name");

    docRef.get()
        .then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var name = doc.get('name');
            console.log(name);
        } else {
            console.log("No such document!");
        }
        }) .catch(function(error) {
            console.log("Error getting document:", error);
        });
    // const ref = db.ref('friends');
    // ref.once('value')
    //     .then(snap => {
    //     console.log(snap.val());
    //     console.log(snap.val().username);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
}
/* GET index page. */
router.get('/', function(req, res, next) {
    getUsername();
  res.render('index', { title: 'Express'});
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

/* POST registering users */
router.post('/registerUser', function(req,res) {
  var db = req.con;

});

/* POST yelp search */
// router.post('/yelpSearch', function(req,res) {
//   var info = req.body;
//
// });

module.exports = router;
