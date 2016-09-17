var config = require('../config/config.js');
var dbname = config.cloudant.dbname;
var Cloudant = require('cloudant')({
    account: config.cloudant.account,
    password: config.cloudant.password
});
module.exports.profileRead = function(req, res) {
    console.log("in profile read" + req.payload.email);
    //if (almostExpired(payload.exp) {
    // refreshToken()
    //}
    if (!req.payload.email) {
        res.status(401).json({
            "message": "UnauthorizedError: private profile"
        });
        res.redirect('/home');
    } else {
        var db = Cloudant.use(dbname);
        db.find({
            selector: {
                username: req.payload.email
            }
        }, function(err, result) {
            if (err) {
                console.log("There was an error finding the user: " + err);
            } else if (result.docs.length == 0) {
                console.log("Username was not found");
                res.redirect('/home');
                return
            } else {
                // user was found, now determine if password matches
                var user = result.docs[0];
                var vmuser = {
                    email: user.username,
                    name: user.username,
                    _id: user._id
                }
                console.log('%%' + user._id);
                res.status(200).json(vmuser);
            }
        })
    }
}
module.exports.profileWrite = function(req, res) {
    console.log("in profile write" + req.payload.email);
    //if (almostExpired(payload.exp) {
    // refreshToken()
    //}
    if (!req.payload.email) {
        res.status(401).json({
            "message": "UnauthorizedError: cannot edit private profile"
        });
    } else {
        var db = Cloudant.use(dbname);
        //create js obj of user with req params
        var user = {
            username: username, //can't change
            password: user.password, //change here???
            //salt: user.salt,
            //refreshToken: user.refreshToken,
            //revoked: false,
            pic: "", //file upload
            wcUser: true,
            wcWidth: req.body.wcWidth,
            step: req.body.step,
            //confirmed: false
        };
        //db.update(user)
    }
    /*function(err, result) {
        if (err) {
            console.log("There was an error editing the profile: " + err);
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
    }*/
}

