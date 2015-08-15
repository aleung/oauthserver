var express = require('express');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var oauth2orize = require('oauth2orize');
var winston = require('winston');

var tokens = require('./tokendb');
var clients = require('./clientdb');
var codes = require('./authcodedb');
var tokens = require('./tokendb');


// client authentication

passport.use(new BasicStrategy(
  function(id, secret, done) {
    clients.find(id, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.secret != secret) { return done(null, false); }
      return done(null, client);
    });
  }
));

// oauth2orize setup

let server = oauth2orize.createServer();

server.grant(oauth2orize.grant.code(
  (client, redirectUri, user, ares, done) => {
    let code = codes.create({
      clientId: client.id,
      redirectUri,
      userId: user.id,
    });
    done(null, code);
  }
));

server.serializeClient(function(client, done) {
  winston.debug('serialize client: ', client);
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  clients.find(id, function(err, client) {
    if (err) { return done(err); }
    return done(null, client);
  });
});

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  codes.use(code, function(err, code) {
    if (err) { return done(err); }
    if (!code || client.id !== code.clientId || redirectURI !== code.redirectUri) {
      return done(null, false); 
    }
    
    // TODO: set expire time
    // TODO: refresh token
    tokens.save({userId: code.userId, clientId: code.clientId, scope: code.scope}, (err, token) => {
      if (err) { return done(err); }
      winston.debug('Save access token %s ', token);
      return done(null, token);
    });
  });
}));

// middleware

function restrictToRole(role) {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  };
}
  
export function authorize() {
  return server.authorize(
    (clientId, redirectUri, done) => {
      winston.debug("/authorize?response_type=code&client_id=%s&redirect_uri=%s", clientId, redirectUri);
      clients.find(clientId, (err, client) => {
        if (err) { return done(err); }
        if (!client) { return done(null, null); }
        // TODO: validate redirectUri
        done(null, client, redirectUri);
      });
    }
  );
}
  
export function decision() {
  return server.decision();
}

// handler
  
function introspect(req, res, next) {
  let tokenString = req.body.token;
  winston.debug('/introspect token=%s', tokenString);
  tokens.find(tokenString, (err, token) => {
    if (err) { return next(err); }
    if (!token) {
      res.json({ active: false });
    } else {
      res.json({
        active: true,
        scope: token.scope,
        client_id: token.clientId,
        username: token.userId,
        exp: token.exp,
      });
    }
  });
}

// express router

export function oauthServerRouter() {
  let router = express.Router();
  
  // token endpoint
  router.post('/token', 
              passport.authenticate('basic', {session: false}), 
              restrictToRole('client'),
              server.token(), 
              server.errorHandler());
  
  // token introspection endpoint
  // https://tools.ietf.org/html/draft-ietf-oauth-introspection
  router.post('/introspect', 
              passport.authenticate('basic', {session: false}), 
              restrictToRole('resource'),
              introspect);
  
  return router;  
}
  