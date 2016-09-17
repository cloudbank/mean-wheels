var config = {}

config.cloudant = {};
config.cloudant.dbname = 'onwheelsusers';
config.cloudant.account = 'onwheelsanubis.cloudant.com';
config.cloudant.password = 'topcoder';

config.admin_user = 'admin@topcoder.com';
config.admin_pass = 'welcome';
config.index_field = 'username';
config.port = process.env.PORT || 3000;

//It’s highly advisable to use a complex string with many different characters and never share this secret key in public
config.jwtSecret =  "8b1f3142324a44623588d9ce3d1b79e0fd1bc24";
//config.jwtSession = {session: false} ;

config.mail_domain = 'sandbox279fc12fd6834b2a8d6be890dca7ea67.mailgun.org';
config.mail_key = 'key-0a8e0839613e268a5f1d097aa7580c4e';
config.register_email_msg = " onwheels registration email";
config.pwd_email_msg = " onwheels registration email";
config.register_email_from = "";
config.register_email_to =  "";

module.exports = config;
