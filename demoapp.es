var express = require('express');
var request = require('request');
var config = require('config');

function redirectUri(req) {
  return `http://${req.headers.host}/app/oauth2callback`
}

// handler

function home(req, res) {
  request.get({
    url: `http://${req.headers.host}/api/user/`,
    auth: {
      bearer: req.session.token
    }
  }, (err, response, body) => {
    if (err) { return res.render('app/failure', {error: err}); }
    if (response.statusCode !== 200) {
      return res.render('app/failure', {error: body});
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
    return res.render('app/failure', { error: req.query.error });
  }
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
    if (err) { return res.render('app/failure', {error: err}); }
    if (response.statusCode !== 200) {
      return res.render('app/failure', {error: body});
    }
    let token = JSON.parse(body).access_token;
    req.session.token = token;
    next();
  });
}

// router

export function appRouter(path) {
  let router = express.Router();
  router.get('/', ensureUserLogin, home);
  router.get('/oauth2callback', authorizationCode, (req, res) => { res.redirect(path); });
  return router;
}