/*

  There are some minor modifications to the default Express setup
  Each is commented and marked with [SH] to make them easy to find

 */

var express = require('express');


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// [SH] Require Passport
var passport = require('passport');

var device = require('express-device');

// [SH] Bring in the Passport config after model is defined
require('./app_api/config/passport');

var config = require('./app_api/config/config.js');

// [SH] Bring in the routes for the API (delete the default routes)
var routesApi = require('./app_api/routes/index');

var app = express();




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// [SH] Set the app_client folder to serve static resources
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(device.capture());
// [SH] Initialise Passport before using the route middleware
app.use(passport.initialize());

// [SH] Use the API routes when path starts with /api
app.use('/api', routesApi);

// [SH] Otherwise render the index.html page for the Angular SPA
// [SH] This means we don't have to map all of the SPA routes in Express
app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
      
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

 http = require('http')
var server = http.createServer(app).listen(config.port, function () {
    console.log('Express server listening on port : '+server.address().port);
});

var  db = require('./app_api/config/db.js');
var init = false;
// test the cloudant connection
var Cloudant = require('cloudant')({account:config.cloudant.account, password:config.cloudant.password});
Cloudant.ping(function(er, reply) {
    if (er)
        return console.log('Failed to ping Cloudant. Did the network just go down?');
    else
        if (init)  {
             db.initialize();
        }
        return console.log('Cloudant connection was successful');
});


module.exports = app;
