var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config.js');
var dbname = config.cloudant.dbname;
var Cloudant = require('cloudant')({
    account: config.cloudant.account,
    password: config.cloudant.password
});
var oop = require('oop-module');
var User = oop.class('../models/User.js');

var owasp = require('owasp-password-strength-test');
 

 owasp.config({
  allowPassphrases       : false,
  maxLength              : 128,
  minLength              : 10,
  minPhraseLength        : 20,
  minOptionalTestsToPass : 4,
});



passport.use('local-login', new LocalStrategy({
    usernameField: 'email'
}, function(username, password, done) {
    // Use Cloudant query to find the user just based on user name
    var db = Cloudant.use(dbname);
    db.find({
        selector: {
            username: username
        }
    }, function(err, result) {
        if (err) {
            console.log("There was an error finding the user: " + err);
            return done(null, false, {
                message: "There was an error connecting to the database"
            });
        }
        if (result.docs.length == 0) {
            console.log("Username was not found");
            return done(null, false, {
                message: "Username was not found"
            });
        }
        // user was found, now determine if password matches
        var user = result.docs[0];
        var u = new User(user.email, user._id, user.password);
        console.log("in local-login" + user._id);
        //crypto
        if (u.validPassword(password, user.salt, user.password)) {
            console.log("Password matches");
            // If credentials are correct, return the user object
            if (!user.confirmed) {
                console.log("Account not confirmed");
            //err = {"reason":"Password is incorrect"};
                return done(null, false, {
                    message: "Account not confirmed"
                });
            } else {
                return done(null, user);
            }
        } else {
            console.log("Password is not correct");
            //err = {"reason":"Password is incorrect"};
            return done(null, false, {
                message: "Password is incorrect"
            });
        }
    })
}));
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
        passReqToCallback : true // allows us to pass back the entire request to the callback
}, function(req,username, password, done) {
    console.log("in local-signup" + req.type);
    // var body = req.body;
    //onsole.log(body)
    // Use Cloudant query to find the user just based on user name
    var db = Cloudant.use(dbname);
    db.find({
        selector: {
            username: username
        }
    }, function(err, result) {
        if (err) {
            console.log("There was an error registering the user: " + err);
            return done(null, false, {
                message: "There was an error connecting to Cloudant"
            });
        } else if (result.docs.length > 0) {
            console.log("Username was found");
            return done(null, false, {
                message: "This username already exists. Choose a different username."
            });
        } else if (owasp.test(password).errors.length > 0) {   // invoke test() to test the strength of a password 
             console.log(owasp.test(password).errors);
             console.log("Password too weak");
            return done(null, false, {
                message: "Password too weak"
            });   
         }   
      
        // create the new user
        var user = new User();
        //setter todo
        //user.email = username;
        //save salt and hash
        user.setSalt();
        //hash
        user.setPassword(user.salt, password);
        user.setRefreshToken(username);
        var user = {
            username: username,
            password: user.password,
            salt: user.salt,
            refreshToken: user.refreshToken,
            revoked: false,
            pic: "",
            wcUser: true,
            wcWidth: 0,
            step: 0,
            confirmed : false,
            device: req.type
        };
        console.log("Register User: " + user.username);
        db.insert(user, function(err, body) {
            if (err) {
                console.log("There was an error registering the user: " + err);
                return done(null, false, {
                    message: "There was a problem inserting the new user into Cloudant"
                });
            } else {
                //success
                return done(null, user);
            }
        })
    })
}));