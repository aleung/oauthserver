var express = require('express');
var session = require('express-session');
var config = require('config');
var passport = require('passport');
var site = require('./site');
var oauth2 = require('./oauth2');
  
  
var app = express();
app.set('view engine', 'ejs');

app.use(session({
  secret : config.get('Server.Session.Secret'),
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
//require('./auth');

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

//app.get('/dialog/authorize', oauth2.authorization);
//app.post('/dialog/authorize/decision', oauth2.decision);

app.post('/oauth/token', oauth2.token);

app.listen(config.get('Server.Port'));