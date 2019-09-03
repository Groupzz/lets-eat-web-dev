var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");

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


module.exports = router;
