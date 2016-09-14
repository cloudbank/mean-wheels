var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dbname = config.cloudant.dbname;
var config = require('./config.js');

var Cloudant = require('cloudant')({account:config.cloudant.account, password:config.cloudant.password});
var oop = require('module-oop');
var User = oop.class('../models/user.js');


passport.use('local-login',new LocalStrategy({
    //usernameField: 'email'
  },
       function(username, password, done) {
          
            // Use Cloudant query to find the user just based on user name
            var db = Cloudant.use(dbname);
            db.find({selector:{username:username}}, function(err, result) {
                if (err){
                    console.log("There was an error finding the user: " + err);
                    return done(null, false, { message : "There was an error connecting to the database" } );
                } 
                if (result.docs.length == 0){
                    console.log("Username was not found");
                    return done(null, false, { message : "Username was not found" } );
                }

                // user was found, now determine if password matches
                var user = result.docs[0];
                //crypto
                if (User.validPassword(user.hash,user.salt,user.password)) {
                    console.log("Password matches");
          
                    // If credentials are correct, return the user object
                    return done(null, user);
                } else {
                    console.log("Password is not correct");
                    //err = {"reason":"Password is incorrect"};
                    return done(null, false, { message :"Password is incorrect"} );
                }                
            })
        }
        ));

passport.use('local-signup', new LocalStrategy({
            //passReqToCallback : true // allows us to pass back the entire request to the callback
        },
         function(username , password, done) {
            

           // Use Cloudant query to find the user just based on user name
            var db = Cloudant.use(dbname);
            db.find({selector:{username:username}}, function(err, result) {
                if (err){
                    console.log("There was an error registering the user: " + err);
                    return done(null, false, { message : "There was an error connecting to Cloudant" } );
                } 
                else if (result.docs.length > 0){
                    console.log("Username was found");
                    return done(null, false, { message : "This username already exists. Choose a different username." } );
                }

                // create the new user
                var user = new User();

                //setter todo
                user.email = username;
                //save salt and hash
                user.setSalt();

                //hash
                user.setPassword(user.salt,password);
             
                var user = { username:username, password: user.password, salt: user.salt };
                console.log("Register User: " + user);
                db.insert(user, function(err, body) {
                    if (err){
                        console.log("There was an error registering the user: " + err);
                        return done(null, false, { message : "There was a problem inserting the new user into Cloudant" } );
                    } else {
                        //success
              
                        return done(null, user);
                    }
                })
            })
        }
       
    ));
