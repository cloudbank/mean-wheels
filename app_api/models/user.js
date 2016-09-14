var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var firstName;
var lastName;
var email;
var password;
    
var pic;
var wcUser = "true";
var wcWidth = 0;
var step = 0;

var hash = '';
var salt = '';



exports.constructor = function() {
   
}

//requires instance;
exports.setPassword = function(salt, password) {
    var hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString('hex');
}
exports.setSalt = function() {
    var salt = crypto.randomBytes(16).toString('hex');
}
//static
exports.validPassword = function(hash, salt, password) {
    var n_hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString('hex');
    return n_hash === hash;
}

exports.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        _id: var _id,
            email: var email,
                name: var name,
                    exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
}