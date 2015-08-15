import {uid} from './util';

let tokens = new Map();

export function find(tokenString, done) {
  let token = tokens.get(tokenString);
  return done(null, token);
};

// token: Object with keys: userId, clientId, scope, exp
export function save(token, done) {
  let tokenString = uid(64);
  tokens.set(tokenString, token);
  return done(null, tokenString);
};