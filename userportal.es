var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var users = require('./userdb');

import {ensureLoggedIn} from 'connect-ensure-login';
import {authorize, decision} from './oauthserver';


// middleware

function authenticate(base) {
  return passport.authenticate('local', {
    successReturnToOrRedirect: base + '/',
    failureRedirect: base + '/login',
    failureFlash: true
  });
}

// handler

function home(req, res) {
  res.render('portal/index', { username: req.user.username });
}

function loginForm(req, res) {
  res.render('portal/login', { failed: req.flash('error') });
}

function authorizeDialog(req, res) {
  res.render('portal/dialog', {transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client});
}

function logout(path) {
  return (req, res) => {
    req.logout();
    res.redirect(path);
  };
}

// passport setup

passport.use(new LocalStrategy(
  (username, password, callback) => {
    users.authenticate(username, password, callback);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  users.find(id, function (err, user) {
    done(err, user);
  });
});

// express router

export function portalRouter(path) {
  let router = express.Router();
  router.get('/', 
             ensureLoggedIn(path + '/login'), 
             home);
  router.get('/login', loginForm);
  router.post('/login', authenticate(path));
  router.get('/logout', logout(path));
  router.get('/authorize',
             ensureLoggedIn(path + '/login'),
             authorize(),
             authorizeDialog);
  router.post('/authorize',
              ensureLoggedIn(path + '/login'),
              decision());
  return router;
}
  