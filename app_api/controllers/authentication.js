var passport = require('passport');
var config = require('../config/config.js');
var Cloudant = require('cloudant')({
    account: config.cloudant.account,
    password: config.cloudant.password
});
var dbname = config.cloudant.dbname;
var oop = require('oop-module');
var User = oop.class('../models/User.js');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var jade = require('jade');
var jwt = require('jsonwebtoken');
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
    auth: {
        api_key: config.mail_key,
        domain: config.mail_domain
    }
}
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
var sendRegistrationEmail = function(jwt, refreshToken) {
    var nodemailerMailgun = nodemailer.createTransport(mg(auth));
    nodemailerMailgun.sendMail({
        from: 'sabine.g.vogel@gmail.com', //config.register_email_from
        to: 'sabine.g.vogel@gmail.com', // An array if you have multiple recipients. config.register_email_to
        subject: config.register_email_msg,
        template: {
            name: 'views/registerEmail.jade',
            engine: 'jade',
            context: {
                jwt: jwt,
                refreshToken: refreshToken,
                type: "confirm"
            }
        }
    }, function(err, info) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            console.log('Response: ' + info);
        }
    });
}
var sendPwdEmail = function(res, jwt, refreshToken) {
    var nodemailerMailgun = nodemailer.createTransport(mg(auth));
    nodemailerMailgun.sendMail({
        from: 'sabine.g.vogel@gmail.com', //config.register_email_from
        to: 'sabine.g.vogel@gmail.com', // An array if you have multiple recipients. config.register_email_to
        subject: config.pwd_email_msg,
        template: {
            name: 'views/pwdEmail.jade',
            engine: 'jade',
            context: {
                jwt: jwt,
                refreshToken: refreshToken,
                type: "pwd"
            }
        }
    }, function(err, info) {
        if (err) {
            console.log('Error: ' + err);
            res.status(401).json(err);
        } else {
            console.log('email sent: ');
            res.status(200).json({
                message: 'email sent: '
            });
        }
    });
}
module.exports.register = function(req, res) {
    //console.log(req.body);
    /*if(!req.body.name || !req.body.email || !req.body.password) {
   sendJSONresponse(res, 400, {
       "message": "All fields required"
     });
    return;
  }*/
    passport.authenticate('local-signup', function(err, user, info) {
        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }
        console.log("in register" + user.username);
        // If a user is found
        if (user) {
            var u = new User(user.username, user.password);
            console.log("in register" + user.username);
            var token = u.generateJwt(user.username);
            console.log("token" + token);
            sendRegistrationEmail(token, user.refreshToken); //jwt sent here 
            res.status(200).json({
                "token": token,
                "refreshToken": user.refreshToken
            });
        } else {
            // If user cannot register
            res.status(401).json(info);
        }
    })(req, res);
};
module.exports.login = function(req, res) {
    /*
       if(!req.body.email || !req.body.password) {
       sendJSONresponse(res, 400, {
        "message": "All fields required"
       });
        return;
       }
    */
    passport.authenticate('local-login', function(err, user, info) {
        var token;
        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }
        console.log("in login" + user.username);
        // If a user is found
        if (user) {
            var u = new User(user.username, user.password);
            var token = u.generateJwt(user.username);
            res.status(200).json({
                "token": token,
                "refreshToken": user.refreshToken
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
};
module.exports.confirmAccount = function(req, res) {
    console.log("try to reset pwd");
    var type = req.query.type;
    if (type == "pwd") {
        //password has to be on req body
        //run owasp(req.body.password))
        req.body.password = "schmooooooo";
        console.log("try to reset pwd");
    }
    var db = Cloudant.use(dbname);
    // the confirm email sends tokens on params
    if (!req.query.token) {
        //no  query params, no access tokens
        res.send(401).json("no access here without a token param");
    } else {
        var token = req.query.token;
        jwt.verify(token, config.jwtSecret, function(err, decoded) {
            if (err) {
                // jwt expired or other err
                var rToken = req.query.refreshToken;
                console.log(err + "***")
                db.find({
                        selector: {
                            refreshToken: rToken
                        }
                    }, function(err, result) {
                        if (err) {
                            res.send(401).json({
                                message: "no access here without a refresh token "
                            });
                        }
                        var user = result.docs[0];
                        if (result.docs.length == 0) {
                            res.status(401).json({
                                message: "no access here without a valid refresh token "
                            });
                            console.log("token was not found");
                        } else if (rToken == user.refreshToken) {
                            console.log("found refresh token");
                            confirmOrReset(res, user, type, req.body.password);
                        } else {
                            console.log("does not match token" + rToken + "    " + user.refreshToken);
                            res.send(401).json({
                                message: "no access here without a refresh token "
                            });
                        }
                    })
                    //if matches confirm account
            } else {
                // ensure the valid jwt corresponds to a document
                db.find({
                        selector: {
                            username: decoded.email
                        }
                    }, function(err, result) {
                        if (err) {
                            res.send(401).json({
                                message: "no access here without a valid token "
                            });
                        } else {
                            var user = result.docs[0];
                            if (result.docs.length == 0) {
                                res.status(401).json({
                                    message: "no access here without a valid refresh token "
                                });
                                console.log("token was not found");
                            } else {
                                console.log("found jwt");
                                confirmOrReset(res, user, type, req.body.password);
                            }
                        }
                    })
                    
            }
        })
    }
}
var confirmOrReset = function(res, user, type, pwd) {
    console.log("type: " + type + user.confirmed);
    var usr = {
        username: user.username,
        password: user.password,
        salt: user.salt,
        refreshToken: user.refreshToken,
        revoked: user.revoked,
        pic: "",
        wcUser: user.wcUser,
        wcWidth: user.wcWidth,
        step: user.step,
        confirmed: user.confirmed,
        _rev:   user._rev
    };
    if (type == "pwd") {
        if (user.confirmed == false) {
            res.status(401).json({
                message: "Account must be activated to reset pwd"
            });
        } else {
            usr.password = pwd;
        }
    } 
        console.log("Confirm User: " + user.username);
        var db = Cloudant.use(dbname);
        db.insert(usr, function(err, body) {
            if (err) {
                console.log("There was an error confirming the user: " + err);
                res.status(401).json({
                    message: "There was a problem inserting the confirmed user into Cloudant"
                });
            } else {
                res.status(200).json({
                    message: "Account " +type+" updated"
                });
            }
        })
    
}
module.exports.resetPwd = function(req, res) {
    console.log("in resetPwd" + req.query.token);
    //pass back the decoded jwt token  on req
    if (!req.query.token) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
        //res.redirect('/home');
    } else {
        //decode the jwt token and send
        //assume UI sends it in auth header
        // get jwt off req and find the reftoken
        //find refresh token from username
        sendPwdEmail(res, req.query.token, null);
    }
}

exports.revoke = function(email) {

    // want to revoke the refresh token per device perhaps as well

    //cloudant could have devices name as index or as field
    //how you got here--> 
    //after x number of failed logins  --> send the email to revoke account if exists
    //bad account activation, or out of order pwd reset, use refresh token to pass in  a valid email
    
    console.log("in revoke" + req.query.refreshToken);
    //pass back the decoded jwt token  on req
    if (!req.query.refreshToken  && !req.query.email) {
        res.status(401).json({
            "message": "require an email or token to revoke"
        });
        //res.redirect('/home');
    } else {
        
        //decode the jwt token and send
        //assume UI sends it in auth header
        // get jwt off req and find the reftoken
        //find refresh token from username
        
    }
}