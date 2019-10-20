'use strict';

var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");
var yelp = require('yelp-fusion');
var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt-nodejs');
const client = yelp.client('p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx');
require("firebase/firestore");

// Global variables
var host, mailOptions,link, buffer = "", usersDataPack = {}, restaurants = [], used = [], randPassFind = [], useremail, userName, secq;

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

/* makes a random id */
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/* checks if it is an email */
function checkEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/* GET index page. */
router.get('/', function(req, res, next) {
    var un = null;
    var userInfo = null;
    if(req.cookies.userInfo != null) {
        un = req.cookies.userInfo.username;
        userInfo = req.cookies.userInfo;
    }
    var timing = new Date();
    console.log("customer ", userInfo, " is here ", timing);
    res.render('index', { title: 'Express' , data: buffer, un, userInfo});
});

/* GET home page. */
router.get('/home', function(req,res) {
    var un = null;
    var userInfo = null;
    if(req.cookies.userInfo != null) {
        un = req.cookies.userInfo.username;
        userInfo = req.cookies.userInfo;
    }
    var timing = new Date();
    console.log("customer ", userInfo, " is here ", timing);
    res.render('defaultPage', { title: 'Default' , data: buffer, un, userInfo })
});

/* GET login page */
router.get('/login', function(req,res) {
    var buffer = "";
    var text = "";
  res.render('signInPage', { title: 'Sign In' , data: buffer, text});
});

/* GET find password */
router.get('/recoverpassword', function(req,res) {
   res.render('recoverPassword', {title: "Recover Password"});
});

/* POST to find password with email */
router.post('/FindPasswordEmail', function(req, res, next){
    var findPassUsr = req.body.email;

    db.collection('users').where('email', '==', findPassUsr).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                console.log("This is null");
                res.render('AccountNotFound', {title:'account not found'});
            }
            else {
                secq = snapshot.docs[0].data().securityquestion;
                useremail = findPassUsr;
                var text = "";
                res.render('passwordEmail', {title: "Password Recover with Email", data: buffer, secq, useremail, text});
            }
        })
});

/* POST checks answer */
router.post('/checkEmailandAnswer', function(req,res) {
    var answer = req.body.guessedAnswer;
    var links = makeid(20);
    randPassFind.push(links);
    db.collection('users').where('email', '==', useremail).get()
        .then((snapshot) => {
            if(snapshot.docs[0].data().securityanswer === answer) {
                host = req.get('host');
                    link = "http://" + req.get('host') + "/PasswordChange?id=" + links;
                    mailOptions = {
                        to: useremail,
                        subject: "Please confirm your Email account",
                        html: "Hello,<br> Please Click on the link to reset the password for your account using " + useremail + ".<br><a href=" + link + ">Click here to verify</a>"
                    };
                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log(error);
                            res.end("error");
                        } else {
                            console.log("Message sent: " + response.message);
                            res.render('PasswordChangeRequestSent', {title: "Please Verify"});
                        }
                    });
            } else {
                var text = "Answer is incorrect";
                res.render('passwordEmail', {title: "Password Recover with Email", data: buffer, secq, useremail, text});
            }
        })
});

/* POST change password with username */
router.post('/FindPasswordUsername', function(req, res, next){
    var findPassUsr = req.body.username;
    db.collection('users').where('username', '==', findPassUsr).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                console.log("This is null");
                res.render('AccountNotFound', {title:'account not found'});
            }
            else {
                var secq = snapshot.docs[0].data().securityquestion;
                userName = findPassUsr;
                var text = "";
                res.render('passwordUsername', {title: "Password Recover with Username", data: buffer, secq, userName, text});
            }
        })
});

/* POST checks answer */
router.post('/checkUsernameandAnswer', function(req,res) {
    var answer = req.body.guessedAnswer;
    var links = makeid(20);
    randPassFind.push(links);
    db.collection('users').where('username', '==', userName).get()
        .then((snapshot) => {
            if(snapshot.docs[0].data().securityanswer === answer) {
                host = req.get('host');
                link = "http://" + req.get('host') + "/PasswordChange?id=" + links;
                mailOptions = {
                    to: snapshot.docs[0].data().email,
                    subject: "Please confirm your Email account",
                    html: "Hello,<br> Please Click on the link to reset the password for your account using " + userName + ".<br><a href=" + link + ">Click here to verify</a>"
                };
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.end("error");
                    } else {
                        console.log("Message sent: " + response.message);
                        res.render('PasswordChangeRequestSent', {title: "Please Verify"});
                    }
                });
            } else {
                var text = "Answer is incorrect";
                res.render('passwordUsername', {title: "Password Recover with Username", data: buffer, secq, userName, text});
            }
        })
});

/* GET Change Password */
router.get("/PasswordChange", function(req, res, next){
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
        console.log("Domain is matched. Information is from Authentic email");
        for(var i in randPassFind) {
            if (req.query.id == randPassFind[i]) {
                console.log("Please fill out the form to change the password");
                randPassFind[i] = "";
                console.log(randPassFind);
                var text = "";
                res.render('ChangePassword', {title: "Reset Password", data: buffer, text});
            }
        }
    }
    else
    {
        res.end("<h1>Request is from unknown source");
    }
});

/* POST change password */
router.post('/changepassword', function(req, res) {
    var creds = req.body.creds;
    var pass = req.body.pass;
    if(checkEmail(creds)) {
        db.collection('users').where('email', '==', creds).get()
            .then((snapshot) => {
                if(snapshot.empty) {
                    console.log("Wrong email used");
                    var text = "Wrong email used. Make sure to use the email mentioned in your email.";
                    res.render('ChangePassword', {title: "Reset Password", data: buffer, text})
                } else {
                    secq = "";
                    useremail = "";
                    console.log("correct");
                    db.collection('users').doc(snapshot.docs[0].id).update({
                        password: bcrypt.hashSync(pass, null, null),
                    });
                    res.redirect('/login')
                }
            })
    } else {
        console.log("This is a username");
        db.collection('users').where('username', '==', creds).get()
            .then((snapshot) => {
                if(snapshot.empty) {
                    console.log("Wrong email used");
                    var text = "Wrong username used. Make sure to use the username mentioned in your email.";
                    res.render('ChangePassword', {title: "Reset Password", data: buffer, text})
                } else {
                    secq = "";
                    userName = "";
                    db.collection('users').doc(snapshot.docs[0].id).update({
                        password: bcrypt.hashSync(pass, null, null),
                    });
                    console.log("correct");
                    res.redirect('/login')
                }
            })
    }
});

/* GET sign up page */
router.get('/register', function(req,res) {
  res.render('signUpPage', { title: 'Sign Up'});
});

/* GET about us page */
router.get('/aboutUs', function(req,res) {
    var un = null;
    var userInfo = null;
    if(req.cookies.userInfo != null) {
        un = req.cookies.userInfo.username;
        userInfo = req.cookies.userInfo;
    }
    var timing = new Date();
    console.log("customer ", userInfo, " is here ", timing);
  res.render('UserManual', { title: 'AboutUs' , data: buffer, un, userInfo});
});

/* GET help page */
router.get('/help', function(req,res) {
    var un = null;
    var userInfo = null;
    if(req.cookies.userInfo != null) {
        un = req.cookies.userInfo.username;
        userInfo = req.cookies.userInfo;
    }
    var timing = new Date();
    console.log("customer ", userInfo, " is here ", timing);
    res.render('helpPage', {title: 'Help Page' , data: buffer, un, userInfo});
});

/* GET account page*/
// Get whatever is needed for the front end
router.get('/accountInterface', function(req, res) {
    var userInformation,preferences, dietaryrestrictions,friends = [];
    if (req.cookies.userInfo!=null) {
        var email = req.cookies.userInfo.email;
        var userPacket = req.cookies.userInfo;
        var username = req.cookies.userInfo.username;
        console.log(email);
        console.log(userPacket);
        // need: all details from users, friends, preferences, dietary restrictions
        db.collection('users').where('email', '==', email).get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    var text = "Username or Password is wrong";
                    res.render('signInPage', {title:'Sign In', data: buffer, text})
                }
                else {
                    userInformation = {
                        email: email,
                        username: username,
                        dob: snapshot.docs[0].data().dateofbirth,
                        fname: snapshot.docs[0].data().firstname,
                        lname: snapshot.docs[0].data().lastname,
                        phone: snapshot.docs[0].data().phone,
                        sq: snapshot.docs[0].data().securityquestion,
                        sa: snapshot.docs[0].data().securityanswer,
                        city: snapshot.docs[0].data().city,
                        state: snapshot.docs[0].data().state,
                        zipcode: snapshot.docs[0].data().zipcode
                    };
                    db.collection('friends').where('username', '==', username).get()
                        .then((friendslist) => {
                            friendslist.docs.forEach(doc => {
                                var friend = {
                                    friendemail: doc.data().friendemail,
                                    friendusername: doc.data().friendusername,
                                    firstname: doc.data().firstname,
                                    lastname: doc.data().lastname
                                };
                                friends.push(friend);
                            });

                            db.collection('preferences').where('username', '==', username).get()
                                .then((preferenceList) => {
                                    preferences = {
                                        American: preferenceList.docs[0].data().American,
                                        Chinese: preferenceList.docs[0].data().Chinese,
                                        Greek: preferenceList.docs[0].data().Greek,
                                        Indian: preferenceList.docs[0].data().Indian,
                                        Italian: preferenceList.docs[0].data().Italian,
                                        Japanese: preferenceList.docs[0].data().Japanese,
                                        Mexican: preferenceList.docs[0].data().Mexican,
                                        Thai: preferenceList.docs[0].data().Thai
                                    };
                                    db.collection('dietaryrestriction').where('username', '==', username).get()
                                        .then((drlist) => {
                                            dietaryrestrictions = {
                                                gf: drlist.docs[0].data().GlutenFree,
                                                halal: drlist.docs[0].data().Hala,
                                                vegan: drlist.docs[0].data().Vegan,
                                                veget: drlist.docs[0].data().Vegetarian
                                            };
                                            var timing = new Date();
                                            console.log("Customer ", username," is here at ",timing);
                                            usersDataPack = req.cookies.userInfo;
                                            res.render('accountInterface', {title:'Account Interface',
                                                data:
                                                    buffer,
                                                    dietaryrestrictions,
                                                    preferences,
                                                    friends,
                                                    userInformation,
                                                    usersDataPack
                                            });
                                        })
                                })

                        })
                }

            })
            .catch((error) => {
               console.log(error);
               res.redirect('/login');
            });
    }
});

/* POST restaurant search */
router.post('/restaurantSearch', function(req,res) {
    var searchTerm = req.body.term;
    var location = req.body.location;

    client.search({
        term: searchTerm,
        location: location,
    })
        .then(response => {

            restaurants = response.jsonBody.businesses;
            //console.log(restaurants);
            var title = "searching for... ";
            var un = null;
            var userInfo = null;
            if(req.cookies.userInfo != null) {
                un = req.cookies.userInfo.username;
                userInfo = req.cookies.userInfo;
            }
            //res.cookie("yelpSearch", userDataPack);

            var timing = new Date();
            console.log("customer ", userInfo, " is here ", timing);
            //restaurants was passed through here
            res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, location, un, userInfo});

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

    db.collection('users').where('email', '==', email).get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log("No matching documents.");
                var text = "Email or Password is wrong.";
                res.render('signInPage',{title:"login", data:buffer, text});
            }
            else {
                if(snapshot.docs[0].data().verified == false) {
                    res.render("accountFoundButNotVerified", {title: "Please verify your email"});
                }
                else {
                    if(bcrypt.compareSync(password,snapshot.docs[0].data().password)) {
                        var userDataPack = {
                            email: snapshot.docs[0].data().email,
                            pass: snapshot.docs[0].data().password,
                            firstName: snapshot.docs[0].data().firstname,
                            lastName: snapshot.docs[0].data().lastname,
                            username: snapshot.docs[0].data().username,
                            docID: snapshot.docs[0].id
                        };
                        if (req.cookies.userInfo == null) {
                            res.cookie("userInfo", userDataPack, {expire: new Date() + 1});
                            console.log("here is the cookie", req.cookies);
                        }
                        res.redirect("/accountInterface");
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

/* GET log out */
router.get("/logout", function(req, res){
    res.clearCookie('userInfo');
    usersDataPack = {};
    res.redirect('/home');
});

/* GET a restaurant from the search */
router.get('/requestRest', function(req, res) {
   if (used.length <= restaurants.length) {
       var i = (Math.random() * restaurants.length) | 0;
       while (used.includes(i)) {
           i = (Math.random() * restaurants.length) | 0;
       }
       used.push(i);
       console.log(restaurants[i]);
       res.send({text: restaurants[i]});
   }
    if (used.length == restaurants.length) {
        console.log("choose another one");
        res.send({text: "Do new search"});
    }
});

module.exports = router;