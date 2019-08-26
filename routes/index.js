var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
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
