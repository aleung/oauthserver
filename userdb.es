var winston = require('winston');
var config = require('config');

var users = config.get("Users");


exports.find = function(id, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.id === id) {
      return done(null, user);
    }
  }
  winston.info('User not found, id: %s', id);
  return done(null, null);
};

exports.authenticate = function(username, password, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username && user.password === password) {
      return done(null, user);
    }
  }
  return done(null, false, { message: 'Invalid credentials'});
};
