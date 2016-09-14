

module.exports.profileRead = function(req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
      var db = Cloudant.use(dbname);
      db.find({selector:{username:username}}, function(err, result) {
        
    
        res.status(200).json(user);
      });
  }

};
