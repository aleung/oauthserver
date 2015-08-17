var express = require('express');
var request = require('request');
var config = require('config');
var winston = require('winston');

function redirectUri(req) {
  return `http://${req.headers.host}/app/oauth2callback`
}

// handler

function home(req, res) {
  winston.debug(`DemoApp calls http://${req.headers.host}/api/user/`);
  request.get({
    url: `http://${req.headers.host}/api/user/`,
    auth: {
      bearer: req.session.token
    }
  }, (err, response, body) => {
    if (err) { return next(err); }
    if (response.statusCode !== 200) {
      winston.warn('DemoApp calling resource API got error response %d', response.statusCode);
      return next(body);
    }
    let user = JSON.parse(body);
    res.render('app/index', {userId: user.id, userName: user.name});
  });
}

// middleware

function ensureUserLogin(req, res, next) {
  let token = req.session['token'];
  if (token) {
    next();
  } else {
    let oauth2Uri = `http://${req.headers.host}/portal/authorize?response_type=code&client_id=demoapp&redirect_uri=` +
        encodeURIComponent(redirectUri(req));
    res.redirect(oauth2Uri);
  }
}

function authorizationCode(req, res, next) {
  if (req.query.error) {
    return next(req.query.error);
  }
  winston.debug(`DemoApp exchanges token from http://${req.headers.host}/oauth2/token/`);
  request.post({
    url: `http://${req.headers.host}/oauth2/token`,
    auth: {
      user: 'demoapp',
      pass: config.get('DemoApp.Secret'),
      sendImmediately: true,
    },
    form: {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: redirectUri(req),
      client_id: 'demoapp',
    },
  }, (err, response, body) => {
    if (err) { return next(err); }
    if (response.statusCode !== 200) {
      winston.warn('DemoApp exchanging token got error response %d', response.statusCode);
      return next(body);
    }
    let token = JSON.parse(body).access_token;
    req.session.token = token;
    next();
  });
}

function errorHandler(err, req, res, next) {
  winston.warn('DemoApp errorHandler:', err);
  res.render('app/failure', {error: err});
}

// router

export function appRouter(path) {
  let router = express.Router();
  router.get('/', ensureUserLogin, home);
  router.get('/oauth2callback', authorizationCode, (req, res) => { res.redirect(path); });
  router.use(errorHandler);
  return router;
}