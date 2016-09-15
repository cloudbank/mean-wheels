var config = require('../config/config.js');
var dbname = config.cloudant.dbname;
var Cloudant = require('cloudant')({
    account: config.cloudant.account,
    password: config.cloudant.password
});
module.exports.profileRead = function(req, res) {
        console.log("in profile" + req.payload.email);
        if (!req.payload.email) {
            res.status(401).json({
                "message": "UnauthorizedError: private profile"
            });
        } else {
            var db = Cloudant.use(dbname);
            db.find({selector: {username: req.payload.email} },
                function(err, result) {
                    if (err) {
                        console.log("There was an error finding the user: " + err);
                    } else if (result.docs.length == 0) {
                        console.log("Username was not found");
                    } else {
                        // user was found, now determine if password matches
                        var user = result.docs[0];
                        var vmuser = {
                            email: user.username,
                            name: user.username,
                            _id: user._id
                        }
                        console.log('%%%' + user._id);
                        res.status(200).json(vmuser);
                    }    
                });
            }
        };