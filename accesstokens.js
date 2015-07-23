/**
 * Access token storage.
 */

var tokens = {};

exports.find = function(key, done) {
  var token = tokens[key];
  return done(null, token);
  // TODO: load from db
};

exports.save = function(token, userId, clientId, done) {
  tokens[token] = { userID: userID, clientID: clientID };
  return done(null);
  // TODO: save into db
};
