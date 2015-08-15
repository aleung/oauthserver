var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var config = require('config');
var passport = require('passport');
var winston = require('winston');
var expressWinston = require('express-winston');
var engine = require('ejs-mate');

import {portalRouter} from './userportal';
import {apiRouter} from './resourceserver';
import {appRouter} from './demoapp';
import {oauthServerRouter} from './oauthserver';


winston.level = 'debug';
  
var app = express();
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(session({
  secret : config.get('Server.Session.Secret'),
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

// User portal
const portalPath = '/portal';
app.use(portalPath, portalRouter(portalPath));

// OAuth server
app.use('/oauth2', oauthServerRouter());

// OAuth client (demo app)
const appPath = '/app';
app.use(appPath, appRouter(appPath));

// Resource server API
app.use('/api', apiRouter());


app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('portal/error', {
    message: err.message,
    error: err
  });
});

app.listen(config.get('Server.Port'));
