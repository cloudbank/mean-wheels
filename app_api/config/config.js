var config = {}

config.cloudant = {};
config.cloudant.dbname = 'onwheelsusers';
config.cloudant.account = 'onwheelsanubis.cloudant.com';
config.cloudant.password = 'topcoder';

config.admin_user = 'admin';
config.admin_pass = 'welcome';
config.index_field = 'username';
config.port = process.env.PORT || 3000;

//It’s highly advisable to use a complex string with many different characters and never share this secret key in public
config.jwtSecret =  "MyS3cr3tK3Y";
config.jwtSession = {session: false} ;




module.exports = config;
