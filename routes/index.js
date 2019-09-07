var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");
var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt-nodejs');
var yelp = require('yelp-fusion');

const apiKey = 'p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx';
require("firebase/firestore");
require("firebase/auth");

var firebaseConfig = {
  apiKey: "AIzaSyCvKLDrNaPfCcEIlvddM4MWXFSbTs4SmT0",
  authDomain: "lets-eat-18b7b.firebaseapp.com",
  databaseURL: "https://lets-eat-18b7b.firebaseio.com",
  projectId: "lets-eat-18b7b",
  storageBucket: "lets-eat-18b7b.appspot.com",
  messagingSenderId: "852218951035",
  appId: "1:852218951035:web:f66d1e057e50f8d4"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
// users - city, dateofbirth, email, firstname, lastname, password, phone, securityanswer, securityquestion, state, username, zipcode
// preferences - username, preference
// statusboard - checkin, username

// Sending emails to the user
let smtpTransport = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers:'SSLv3'
  },
  auth: {
    user: 'register@pvnet.com',
    pass: 'R3gi$t3r'
  }
});

/* GET index page. */
router.get('/', function(req, res, next) {
  db.collection('friends').get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
      console.log(doc.data());
    })
  });
  res.render('index', { title: 'Express' });
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
router.post('/yelpSearch', function(req,res) {
  var info = req.body;

});

module.exports = router;
