var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config/config.js');



var _id;

var name;
var email;
var password;
    
var pic;
var wcUser = "true";
var wcWidth = 0;
var step = 0;


var salt = '';
var refreshToken = "";
var revoked = false;
var confirmed = false;

exports.constructor = function() {
   
}

exports.constructor = function(email, password) {
   this.email = email;
   //this.name = name;
   
   this.password = password;
   
}

//
exports.setPassword = function(salt, password) {
    this.password = crypto.pbkdf2Sync(password, salt, 1000, 64,'sha512').toString('hex');

}
exports.setSalt = function() {
   this.salt = crypto.randomBytes(16).toString('hex');
}
//
exports.validPassword = function(password, salt,hashpwd) {
    var newhash = crypto.pbkdf2Sync(password, salt, 1000, 64,'sha512').toString('hex');
    return newhash === hashpwd;
}

exports.generateJwt = function(email) {
    
    return  jwt.sign({ email: email, name: email   }, config.jwtSecret, { expiresIn: "1d" });
    // DO NOT KEEP YOUR SECRET IN THE CODE!
}

exports.setRevoked = function(revoked) {
  this.revoked = revoked;
}

exports.setRefreshToken = function(email) {
 this.refreshToken =  email.toString() + '.' + crypto.randomBytes(
      40).toString('hex');
}
