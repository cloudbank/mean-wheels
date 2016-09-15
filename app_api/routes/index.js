var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('../config/config.js');


var auth = jwt({
  secret: config.jwtSecret,
  userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');


// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
