var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('../config/config.js');


var auth = jwt({
  secret: config.jwtSecret,
  requestProperty: 'payload',
  getToken: function fromHeaderOrQuerystring (req) {
  	//customize here how to get the token
  	
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      var jwtToken = req.headers.authorization.split(' ')[1];
    	console.log("^^^^"+jwtToken);
        return jwtToken;
    } else if (req.query && req.query.token) {
      return req.query.token;
    } else if (req.query &&  req.query.refreshToken) {
      return req.query.refreshToken;
    }

    //@todo
    return null;
  }

});  


 

//router.get('/logout');


var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');



//pwd management and activation
router.post('/confirmAccount',ctrlAuth.confirmAccount);
router.post('/resetPwd', auth, ctrlAuth.resetPwd);
router.post('/revoke', auth, ctrlAuth.revoke);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);





// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.post('/profile', auth, ctrlProfile.profileWrite);


module.exports = router;
