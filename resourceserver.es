var express = require('express');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var request = require('request');
var config = require('config');
var users = require('./userdb');
    
passport.use(new BearerStrategy(
  (accessToken, done) => {
    request.post({
      url: `http://localhost:${config.get('Server.Port')}/oauth2/introspect`,
      auth: {
        user: 'resource',
        pass: config.get('ResourceServer.Secret'),
        sendImmediately: true,
      },
      form: {
        token: accessToken,
      },
    }, (err, response, body) => {
      if (err) {
        return done(err);
      }
      if (response.statusCode !== 200) {
        return done(null, false);
      }
      let tokenInfo = JSON.parse(body);
      if (!tokenInfo.active) {
        return done(null, false);
      }
      users.find(tokenInfo.username, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        done(null, user, {
          scope: tokenInfo.scope
        });
      });
    });
  }
));

function userInfo(req, res) {
  res.json({
    id: req.user.id,
    name: req.user.name,
  });
}


export function apiRouter() {
  let router = express.Router();
  router.get('/user', passport.authenticate('bearer', {session: false}), userInfo);
  return router;
}
