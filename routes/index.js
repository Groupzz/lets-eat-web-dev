'use strict';

//import {FieldValueImpl as FieldValue} from "@firebase/firestore/dist/src/api/field_value";
const FieldValue = require('firebase-admin').firestore.FieldValue;
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
                    db.collection('users').doc(snapshot.docs[0].data().id).update({
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
});
/* Changing navigation */
router.get('/accountInterface/personalinfo', function (req, res) {
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            db.collection('users').where('id', '==', user.uid).get()
                .then((uInfo) => {
                    var userInfo = uInfo.docs[0].data();
                    var username = user.displayName;
                    var docID = uInfo.docs[0].id;
                    var timing = new Date();
                    console.log("Customer ", username," is here at ",timing);
                    console.log(userInfo);

                    res.render('PersonalInformation', {title:'Personal Information', data: buffer, username, docID, userInfo});
                })
                .catch((error) => {
                    console.log(error);
                    res.redirect('/');
                });
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
            db.collection('friends').where('id', '==', user.uid).get()
                .then((friends) => {
                    var username = user.displayName;
                    var docID = friends.docs[0].id;
                    var timing = new Date();
                    var unavailable = "";
                    var friendsList = friends.docs[0].data().friends;
                    console.log("Customer ", username," is here at ",timing);

                    res.render('Friends', {title:'Friends', data: buffer, username, docID, unavailable, friendsList});
                })
                .catch((error) => {
                    console.log(error);
                })
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
            db.collection('preferences').where('id','==',user.uid).get()
                .then((preferences) => {
                    var username = user.displayName;
                    var docID = preferences.docs[0].id;
                    var timing = new Date();
                    var prefs = preferences.docs[0].data();
                    console.log(prefs);
                    console.log("Customer ", username," is here at ",timing);

                    res.render('Preferences', {title:'Preferences', data: buffer, username, docID, prefs});
                })
                .catch((error) => {
                   console.log(error);
                });
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
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, un});
                    } else {
                        console.log("Yelp:",un);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, un});
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
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, un});
                    } else {
                        console.log("Yelp:",un);
                        //restaurants was passed through here
                        res.render('yelpSearchPage', {title: title, data: buffer, searchTerm, un});
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
        id: "N/A"
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
        friendsDocID: 'N/A',
        likedRestaurantsID: 'N/A',
        preferencesID: 'N/A',
        id: 'N/A'
    };

    var friends = {
        friends: [],
        id: 'N/A'
    };

    var likedRestaurants = {
      restaurantIDs: [],
        id: 'N/A'
    };

    var actionCodeSettings = {
        url: 'http://localhost:3000/verify',
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
                    userInfo.id = cred.user.uid;
                    prefs.id = cred.user.uid;
                    friends.id = cred.user.uid;
                    likedRestaurants.id = cred.user.uid;
                    db.collection('users').add(
                        userInfo
                    )
                        .then(function (userRef) {
                            console.log("Users document created");
                            db.collection('preferences').add(
                                prefs
                            )
                                .then(function (prefRef) {
                                    console.log("Preferences document created");
                                    db.collection('friends').add(
                                        friends
                                    )
                                        .then(function(friendRef) {
                                            console.log("Friends Document created");
                                            db.collection('likedRestaurants').add(
                                                likedRestaurants
                                            )
                                                .then(function(likedRef) {
                                                    console.log("LikedRestaurants Document created");
                                                    db.collection('users').doc(userRef.id).update({
                                                        friendsDocID: friendRef.id,
                                                        likedRestaurantsID: likedRef.id,
                                                        preferencesID: prefRef.id
                                                    })
                                                        .then(function() {
                                                            console.log("Updated friendsID and likedRestaurantsID");
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
                                                        .catch(function(error) {
                                                           console.log("Error updated friends and bookmarked id");
                                                        });
                                                })
                                                .catch(function(error) {
                                                    console.log("Error adding likedRestaurants document: ", error);
                                                });
                                        })
                                        .catch(function (error) {
                                            console.log("Error adding friends document: ", error);
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

/* GET a friend through search */
router.post('/friendSearch', function(req,res) {
    var un = null;
    auth.onAuthStateChanged(function(user) {
        // Signed in
        if(user) {
            var friendUser = req.body.friendUser;
            // Looks for the current user to get the friend document id
            db.collection('users').where('username','==',user.displayName).get()
                .then((current) => {
                    console.log(current.docs[0].data().friendsDocID);
                    // gets the list of friends from the current user
                    db.collection('friends').doc(current.docs[0].data().friendsDocID).get()
                        .then((friendss) => {
                            console.log("Friends list",friendss.data().friends);
                            var isFound = false;
                            var list = friendss.data().friends;
                            list.forEach(function(item) {
                                if (item === friendUser) {
                                    console.log("already have that person as a friend");
                                    isFound = true;
                                }
                            });

                            // if user is already in the friends list
                            if (isFound) {
                                var username = user.displayName;
                                var unavailable = "User is in your friends list";
                                var docID = user.uid;
                                var timing = new Date();
                                var friendsList = list;
                                console.log("Customer ", username," is here at ",timing);

                                res.render('Friends', {title:'Friends', data: buffer, username, docID, unavailable, friendsList});
                            } else { // If friend is not in my list
                                // CHeck if the username they are searching for exists
                                db.collection('users').where('username','==',friendUser).get()
                                    .then((users) => {
                                        if (users.empty) {
                                            var username = user.displayName;
                                            var unavailable = "User does not exist";
                                            var docID = user.uid;
                                            var timing = new Date();
                                            var friendsList = list;
                                            console.log("Customer ", username, " is here at ", timing);

                                            res.render('Friends', {title: 'Friends', data: buffer, username, docID, unavailable, friendsList});
                                        } else { // If it does exist, add to current users friend's list
                                            list.push(friendUser);
                                            db.collection('friends').doc(current.docs[0].data().friendsDocID).update({
                                                friends: list
                                            })
                                                .then(function() {
                                                    console.log("Added for current to friends");
                                                    // Now add current user to the searched up friends list by first gettiing document ID from users
                                                    db.collection('users').where('username','==',friendUser).get()
                                                        .then((friendUser) => {
                                                            db.collection('friends').doc(friendUser.docs[0].data().friendsDocID).get()
                                                                .then((fuser) => {
                                                                    // Take the friends list out of the friend's side and add the current user
                                                                    var flist = fuser.data().friends;
                                                                    flist.push(user.displayName);
                                                                    db.collection('friends').doc(friendUser.docs[0].data().friendsDocID).update({
                                                                        friends: flist
                                                                    })
                                                                        .then(function() {
                                                                            console.log("Added for other user to friends");
                                                                            res.redirect('/accountInterface/friends');
                                                                        })
                                                                        .catch(function(error) {
                                                                            console.log(error);
                                                                        });
                                                                })
                                                                .catch((error) => {
                                                                    console.log(error);
                                                                })
                                                        })
                                                        .catch(function(error) {
                                                            console.log(error)
                                                        });
                                                })
                                                .catch(function(error) {
                                                    console.log(error);
                                                });
                                        }
                                    })
                            }
                        })
                })
                .catch((error) => {
                    console.log(error);
                    res.redirect('/');
                });


        } else {
            console.log("search:",un);
        }
    });
});

router.get('/ChangeUN', function(req,res) {
    var query = require('url').parse(req.url, true).query;
   var id = query.id;
   var un = query.username;
   console.log(un);
    auth.currentUser.updateProfile({
        displayName: un
    })
        .then(function() {
           db.collection('users').doc(id).update({
               username: un
           })
               .then(function() {
                   var text = "Changed username";
                   return res.send({text: text});
               })
        })
        .catch(function(error) {
            console.log(error);
        });
});
router.get('/ChangeName', function(req,res) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id;
    var fname = query.fname;
    var lname = query.lname;

    db.collection('users').doc(id).update({
        firstname: fname,
        lastname: lname
    })
        .then(() => {
            var text = "Changed name";
            return res.send({text: text});
        })
});
router.get('/ChangePhone', function(req,res) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id;
    var ph = query.phone;

    db.collection('users').doc(id).update({
        phone: ph
    })
        .then(() => {
            var text = "Changed phone";
            return res.send({text: text});
        })
});
router.get('/ChangeLocation', function(req,res) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id;
    var city = query.city;
    var state = query.state;
    var zip = query.zip;

    db.collection('users').doc(id).update({
        city: city,
        state: state,
        zipcode: zip
    })
        .then(() => {
            var text = "Changed location";
            return res.send({text: text});
        })
});
router.get('/ChangePassword', function(req, res) {
   var query = require('url').parse(req.url, true).query;
   var id = query.id;
   var pw = query.pw;

   auth.currentUser.updatePassword(pw)
       .then(() => {
           var text = "Changed password";
           return res.send({text: text});
       })
       .catch((error) => {
           console.log(error);
       });
});
router.get('/ChangePrefs', function(req, res) {
    var query = require('url').parse(req.url, true).query;
    var id = query.id, am = false, me = false, ch = false, ja = false, th = false, it = false, ind = false, gr = false;
    if (query.am.match("true")) am = true;
    if (query.me.match("true")) me = true;
    if (query.ja.match("true")) ja = true;
    if (query.ch.match("true")) ch = true;
    if (query.th.match("true")) th = true;
    if (query.it.match("true")) it = true;
    if (query.ind.match("true")) ind = true;
    if (query.gr.match("true")) gr = true;

    db.collection('preferences').doc(id).update({
        American: am,
        Chinese: ch,
        Greek: gr,
        Indian: ind,
        Italian: it,
        Japanese: ja,
        Mexican: me,
        Thai: th
    })
        .then(() => {
            var text = "Changed preferences";
            return res.send({text: text});
        })
        .catch((error) => {
            console.log(error);
        });
});
module.exports = router;