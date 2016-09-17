var passport = require('passport');
var config = require('../config/config.js');
var Cloudant = require('cloudant')({account:config.cloudant.account, password:config.cloudant.password});
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
  from: 'sabine.g.vogel@gmail.com',  //config.register_email_from
  to: 'sabine.g.vogel@gmail.com', // An array if you have multiple recipients. config.register_email_to
  
  subject: config.register_email_msg,
  template: {
    name: 'views/registerEmail.jade',
    engine: 'jade',
    context: {jwt: jwt, refreshToken: refreshToken }
  }
}, function (err, info) {
  if (err) {
    console.log('Error: ' + err);
  }
  else {
    console.log('Response: ' + info);
  }
});
}

var sendPwdEmail = function(jwt, refreshToken) {
  var nodemailerMailgun = nodemailer.createTransport(mg(auth));
  nodemailerMailgun.sendMail({
  from: 'sabine.g.vogel@gmail.com',  //config.register_email_from
  to: 'sabine.g.vogel@gmail.com', // An array if you have multiple recipients. config.register_email_to
  
  subject: config.pwd_email_msg,
  template: {
    name: 'views/pwdEmail.jade',
    engine: 'jade'
  }
}, function (err, info) {
  if (err) {

    console.log('Error: ' + err);
    res.status(401).json(err);
  }
  else {
    console.log('email sent: ');

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
      sendRegistrationEmail(token, user.refreshToken);  //jwt sent here 
      res.status(200).json({"token":token, "refreshToken": user.refreshToken});
      
      
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
      res.status(200).json({"token":token, "refreshToken": user.refreshToken} );
      
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};

module.exports.confirmAccount = function(req, res) {
    var db = Cloudant.use(dbname);
    // activate email sends tokens on params
    if (!req.query.token) {
        //no access token 
        res.send(401).json("no access here without a token param");
     } else {
        var token = req.query.token;
        jwt.verify(token, config.jwtSecret, function(err, decoded) {
          if (err)  {
            // jwt expired or other err
            var rToken = req.query.refreshToken;
            console.log(rToken+"***")
            
            db.find({ selector:
                    { refreshToken:  "sam@gmail.com.1b7dcc878de00b92f62d359bce3dcb6d5966a6a634415384dee8941a14b412f5562e1c37493871b4"  } 
                    

            }, function(err, result) {
               if (err) {
                res.send(401).json({message: "no access here without a refresh token "});
               }

             
            var user = result.docs[0];
            if (result.docs.length == 0) {
              res.status(401).json({message: "no access here without a valid refresh token "});

              console.log("token was not found");
             } else if (rToken == user.refreshToken) {
              console.log("found token");
               //confirmAccount(user);
             } else {
                console.log("does not match token"  + rToken +"    "+ user.refreshToken);
             }

            
              
            })
            //if matches confirm account

          } else {
            //confirm acount valid jwt
            var user = decoded.email;
            //confirmAccount(user);
             console.log("found jwt");
            //find user and confirm account


          }
        })
      }


    
  }



module.exports.forgotPwd = function(req, res) {
      res.send(200);
}


module.exports.resetPwd = function(req, res) {
  console.log("in resetPwd");
   //onsubmit
   //check password w owasp
   //update db
   // redirect to profile
   //generate a new token and send refresh token
   sendPwdEmail(jsonToken,refreshToken);
   res.status(200).json({ message:  "email sent"});
}

