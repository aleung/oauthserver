var oauth2orize = require('oauth2orize');
var passport = require('passport');
var login = require('connect-ensure-login');
  

var server = oauth2orize.createServer();

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()  
]

exports.verify = [
]
