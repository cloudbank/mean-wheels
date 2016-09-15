var passport = require('passport');
var config = require('../config/config.js');
var Cloudant = require('cloudant')({account:config.cloudant.account, password:config.cloudant.password});
var dbname = config.cloudant.dbname;
var oop = require('oop-module');
var User = oop.class('../models/User.js');


var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
   console.log(req.body);
   if(!req.body.name || !req.body.email || !req.body.password) {
   sendJSONresponse(res, 400, {
       "message": "All fields required"
     });
    return;
  }
 
  passport.authenticate('local-signup', function(err, user, info){
 // If Passport throws/catches an error

  if (err) {
      res.status(404).json(err);
      return;
    }
     console.log("in register" + user.username);

    // If a user is found
    if(user){
      var u = new User(user.username, user.password);
console.log("in register" + user.username);
      var token = u.generateJwt(user.username);
      console.log("token"+token);
      res.status(200).json({"token":token});

      
    } else {
      // If user cannot register
      res.status(401).json(info);
    }
  })(req, res);



  

};

module.exports.login = function(req, res) {

  // if(!req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }

  passport.authenticate('local-login', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }
    console.log("in login"+ user.username);
    // If a user is found
    if(user){
      var u = new User(user.username, user.password);

      var token = u.generateJwt(user.username);
      res.status(200).json({"token":token});;
      
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};