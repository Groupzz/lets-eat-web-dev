'use strict';

var express = require('express');
var router = express.Router();
var firebase = require("firebase/app");
var yelp = require('yelp-fusion');
var bcrypt = require('bcrypt-nodejs');
const client = yelp.client('p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx');
require("firebase/firestore");
require("firebase/auth");

// Global variables
var host,link, buffer = "", restaurants = [], used = [], randPassFind = [], useremail, userName, secq;

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
// Create the database connection and authentication
const db = firebase.firestore();
// Update firestore settings
const auth = firebase.auth();

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

/* Validates that there is only letters */
function validate(check){
    var re = /^[A-Za-z]+$/;
    return (re.test(check))
}

/* GET index page. */
router.get('/', function(req, res, next) {
    var un = null;
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            un = user.displayName;
            var timing = new Date();
            console.log("Index: customer ", un, " is here ", timing);
            res.render('index', { title: 'Express' , data: buffer, un});
        } else {
            console.log("Index:",un);
            res.render('index', { title: 'Express' , data: buffer, un});
        }
    });
});

/* GET home page. */
router.get('/home', function(req,res) {
    auth.onAuthStateChanged(function(user) {
        var un = null;
        // Signed in
        if(user) {
            un = user.displayName;
            var timing = new Date();
            console.log("Home: customer ", un, " is here ", timing);
            res.render('defaultPage', { title: 'Default' , data: buffer, un});
        } else {
            console.log("Home:",un);
            res.render('defaultPage', { title: 'Default' , data: buffer, un});
        }
    });
});

/* GET login page */
router.get('/login', function(req,res) {
    var buffer = "";
    var text = "";
  res.render('signInPage', { title: 'Sign In' , data: buffer, text});
});

/* GET find password FIXX*/
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

/* POST checks answer FIXX*/
router.post('/checkEmailandAnswer', function(req,res) {
    var answer = req.body.guessedAnswer;
    var links = makeid(20);
    randPassFind.push(links);
    db.collection('users').where('email', '==', useremail).get()
        .then((snapshot) => {
            if(snapshot.docs[0].data().securityanswer === answer) {
                host = req.get('host');
                    link = "http://" + req.get('host') + "/PasswordChange?id=" + links;
                    // mailOptions = {
                    //     to: useremail,
                    //     subject: "Please confirm your Email account",
                    //     html: "Hello,<br> Please Click on the link to reset the password for your account using " + useremail + ".<br><a href=" + link + ">Click here to verify</a>"
                    // };
                    // smtpTransport.sendMail(mailOptions, function (error, response) {
                    //     if (error) {
                    //         console.log(error);
                    //         res.end("error");
                    //     } else {
                    //         console.log("Message sent: " + response.message);
                    //         res.render('PasswordChangeRequestSent', {title: "Please Verify"});
                    //     }
                    // });
            } else {
                var text = "Answer is incorrect";
                res.render('passwordEmail', {title: "Password Recover with Email", data: buffer, secq, useremail, text});
            }
        })
});

/* POST change password with username FIXX*/
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

/* POST checks answer FIXX*/
router.post('/checkUsernameandAnswer', function(req,res) {
    var answer = req.body.guessedAnswer;
    var links = makeid(20);
    randPassFind.push(links);
    db.collection('users').where('username', '==', userName).get()
        .then((snapshot) => {
            if(snapshot.docs[0].data().securityanswer === answer) {
                host = req.get('host');
                link = "http://" + req.get('host') + "/PasswordChange?id=" + links;
                // mailOptions = {
                //     to: snapshot.docs[0].data().email,
                //     subject: "Please confirm your Email account",
                //     html: "Hello,<br> Please Click on the link to reset the password for your account using " + userName + ".<br><a href=" + link + ">Click here to verify</a>"
                // };
                // smtpTransport.sendMail(mailOptions, function (error, response) {
                //     if (error) {
                //         console.log(error);
                //         res.end("error");
                //     } else {
                //         console.log("Message sent: " + response.message);
                //         res.render('PasswordChangeRequestSent', {title: "Please Verify"});
                //     }
                // });
            } else {
                var text = "Answer is incorrect";
                res.render('passwordUsername', {title: "Password Recover with Username", data: buffer, secq, userName, text});
            }
        })
});

/* GET Change Password FIXX*/
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

/* POST change password FIXXXX*/
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
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            un = user.displayName;
            var timing = new Date();
            console.log("AboutUS: customer ", un, " is here ", timing);
            res.render('UserManual', { title: 'AboutUs' , data: buffer, un});
        } else {
            console.log("AboutUS: ",un);
            res.render('UserManual', { title: 'AboutUs' , data: buffer, un});
        }
    });
});

/* GET help page */
router.get('/help', function(req,res) {
    var un = null;
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            un = user.displayName;
            var timing = new Date();
            console.log("Help: customer ", un, " is here ", timing);
            res.render('helpPage', {title: 'Help Page' , data: buffer, un});
        } else {
            console.log("Help:",un);
            res.render('helpPage', {title: 'Help Page' , data: buffer, un});
        }
    });
});

/* GET account page*/
// Get whatever is needed for the front end
router.get('/accountInterface', function(req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var username = user.displayName;
            var docID = user.uid;
            var timing = new Date();
            console.log("Account: Customer ", username," is here at ",timing);

            res.render('accountInterface', {title:'Account Interface', data: buffer, username, docID});
        } else {
            console.log("User is not logged in");
            res.redirect('/home');
        }
    });
    // var userInformation,preferences, dietaryrestrictions,friends = [];
    // if (req.cookies.userInfo!=null) {
    //     var email = req.cookies.userInfo.email;
    //     var userPacket = req.cookies.userInfo;
    //     var username = req.cookies.userInfo.username;
    //     console.log(email);
    //     console.log(userPacket);
    //     // need: all details from users, friends, preferences, dietary restrictions
    //     db.collection('users').where('email', '==', email).get()
    //         .then((snapshot) => {
    //             if (snapshot.empty) {
    //                 var text = "Username or Password is wrong";
    //                 res.render('signInPage', {title:'Sign In', data: buffer, text})
    //             }
    //             else {
    //                 userInformation = {
    //                     email: email,
    //                     username: username,
    //                     dob: snapshot.docs[0].data().dateofbirth,
    //                     fname: snapshot.docs[0].data().firstname,
    //                     lname: snapshot.docs[0].data().lastname,
    //                     phone: snapshot.docs[0].data().phone,
    //                     sq: snapshot.docs[0].data().securityquestion,
    //                     sa: snapshot.docs[0].data().securityanswer,
    //                     city: snapshot.docs[0].data().city,
    //                     state: snapshot.docs[0].data().state,
    //                     zipcode: snapshot.docs[0].data().zipcode
    //                 };
    //                 db.collection('friends').where('username', '==', username).get()
    //                     .then((friendslist) => {
    //                         friendslist.docs.forEach(doc => {
    //                             var friend = {
    //                                 friendemail: doc.data().friendemail,
    //                                 friendusername: doc.data().friendusername,
    //                                 firstname: doc.data().firstname,
    //                                 lastname: doc.data().lastname
    //                             };
    //                             friends.push(friend);
    //                         });
    //
    //                         db.collection('preferences').where('username', '==', username).get()
    //                             .then((preferenceList) => {
    //                                 preferences = {
    //                                     American: preferenceList.docs[0].data().American,
    //                                     Chinese: preferenceList.docs[0].data().Chinese,
    //                                     Greek: preferenceList.docs[0].data().Greek,
    //                                     Indian: preferenceList.docs[0].data().Indian,
    //                                     Italian: preferenceList.docs[0].data().Italian,
    //                                     Japanese: preferenceList.docs[0].data().Japanese,
    //                                     Mexican: preferenceList.docs[0].data().Mexican,
    //                                     Thai: preferenceList.docs[0].data().Thai
    //                                 };
    //                                 db.collection('dietaryrestriction').where('username', '==', username).get()
    //                                     .then((drlist) => {
    //                                         dietaryrestrictions = {
    //                                             gf: drlist.docs[0].data().GlutenFree,
    //                                             halal: drlist.docs[0].data().Hala,
    //                                             vegan: drlist.docs[0].data().Vegan,
    //                                             veget: drlist.docs[0].data().Vegetarian
    //                                         };
    //                                         var timing = new Date();
    //                                         console.log("Customer ", username," is here at ",timing);
    //                                         res.render('accountInterface', {title:'Account Interface',
    //                                             data:
    //                                                 buffer,
    //                                                 dietaryrestrictions,
    //                                                 preferences,
    //                                                 friends,
    //                                                 userInformation
    //
    //                                         });
    //                                     })
    //                             })
    //
    //                     })
    //             }
    //
    //         })
    //         .catch((error) => {
    //            console.log(error);
    //            res.redirect('/login');
    //         });
    // }
});
/* Changing navigation */
router.get('/accountInterface/personalinfo', function (req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var username = user.displayName;
            var docID = user.uid;
            var timing = new Date();
            console.log("Customer ", username," is here at ",timing);

            res.render('PersonalInformation', {title:'Personal Information', data: buffer, username, docID});
        } else {
            console.log("User is not logged in");
            res.redirect('/home');
        }
    });
});
router.get('/accountInterface/friends', function (req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var username = user.displayName;
            var docID = user.uid;
            var timing = new Date();
            console.log("Customer ", username," is here at ",timing);

            res.render('Friends', {title:'Friends', data: buffer, username, docID});
        } else {
            console.log("User is not logged in");
            res.redirect('/home');
        }
    });
});
router.get('/accountInterface/preferences', function (req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var username = user.displayName;
            var docID = user.uid;
            var timing = new Date();
            console.log("Customer ", username," is here at ",timing);

            res.render('Preferences', {title:'Preferences', data: buffer, username, docID});
        } else {
            console.log("User is not logged in");
            res.redirect('/home');
        }
    });
});
router.get('/accountInterface/bookmark', function (req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var username = user.displayName;
            var docID = user.uid;
            var timing = new Date();
            console.log("Customer ", username," is here at ",timing);

            res.render('Bookmark', {title:'Bookmark', data: buffer, username, docID});
        } else {
            console.log("User is not logged in");
            res.redirect('/home');
        }
    });
});

/* POST restaurant search */
router.post('/restaurantSearch', function(req,res) {
    var searchTerm = req.body.term;
    var location = req.body.location;
    var loc = location.split(",");
    console.log(loc);
    if (loc.length != 2) {
        client.search({
            term: searchTerm,
            location: location,
        })
            .then(response => {
                restaurants = response.jsonBody.businesses;
                var title = "searching for... ";
                var un = null;
                auth.onAuthStateChanged(function(user) {
                    // Signed in
                    if(user) {
                        un = user.displayName;
                        var timing = new Date();
                        console.log("Yelp: customer ", un, " is here ", timing);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, location, un});
                    } else {
                        console.log("Yelp:",un);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, location, un});
                    }
                });
            })
            .catch(e => {
                console.log(e);
            });
    } else {
        client.search({
            term: searchTerm,
            latitude: loc[0],
            longitude: loc[1]
        })
            .then(response => {
                restaurants = response.jsonBody.businesses;
                var title = "searching for... ";
                var un = null;
                auth.onAuthStateChanged(function(user) {
                    // Signed in
                    if(user) {
                        un = user.displayName;
                        var timing = new Date();
                        console.log("Yelp: customer ", un, " is here ", timing);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, location, un});
                    } else {
                        console.log("Yelp:",un);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, location, un});
                    }
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
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
        uid: "N/A"
    };

    var userInfo = {
        username: un,
        email: email,
        firstname: fn,
        lastname: ln,
        dateofbirth: dob,
        city: city,
        state: state,
        zipcode: zip,
        phone: phone,
        securityquestion: secq,
        securityanswer: seca,
        uid: 'N/A'
    };

    var actionCodeSettings = {
        url: 'http://localhost:3000/verify',
        // iOS: {
        //     bundleId: 'com.example.ios'
        // },
        // android: {
        //     packageName: 'com.example.android',
        //     installApp: true,
        //     minimumVersion: '12'
        // },
        handleCodeInApp: true
    };

    // Takes in username and password and gives the credential
    auth.createUserWithEmailAndPassword(email, pass)
        .then(cred => {
            console.log(cred.user);
            auth.currentUser.updateProfile({
                displayName: un
            })
                .then(function() {
                    console.log("Successfully updated user", auth.currentUser.displayName);
                    userInfo.uid = cred.user.uid;
                    prefs.uid = cred.user.uid;
                    db.collection('users').add(
                        userInfo
                    )
                        .then(function () {
                            console.log("Users document created");
                            db.collection('preferences').add(
                                prefs
                            )
                                .then(function () {
                                    console.log("Preferences document created");
                                    auth.currentUser.sendEmailVerification(actionCodeSettings)
                                        .then(function() {
                                            console.log("Email sent" + actionCodeSettings.url);
                                            res.redirect('/home');
                                        })
                                        .catch(function() {
                                            console.log("ERROR");
                                            res.end("error");
                                        });
                                })
                                .catch(function (error) {
                                    console.log("Error adding preferences document: ", error);
                                });
                        })
                        .catch(function (error) {
                            console.log("Error adding users document: ", error);
                        });
                })
                .catch(function(error) {
                   console.log("Couldn't update user");
                });
        })
        .catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;

           console.log(errorCode);
           console.log(errorMessage);
            res.send('error');
        });

});

/* GET verify account */
router.get('/verify', function(req,res){
    res.redirect('/home');
});

/* Post request to sign in */
router.post('/signIn', function(req,res) {
    var email = req.body.email;
    var password = req.body.pass;

    auth.signInWithEmailAndPassword(email,password)
        .then(function() {
            console.log("Signed in");
            res.redirect("/accountInterface");
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Could not sign in");
            var text = "Username or Password is wrong";
            res.render('signInPage', {title: "login", data: buffer, text});
        });
});

/* GET log out */
router.get("/logout", function(req, res){
    auth.signOut().then(function() {
        console.log("Sign out successful");
        res.redirect('/home');
    }).catch(function(error) {
        console.log("Sign out unsuccessful");
        res.redirect('/home');
    });
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
    else if (used.length == restaurants.length) {
        console.log("choose another one");
        var text = "Do new search";
        res.send({text: text});
    }
});

module.exports = router;