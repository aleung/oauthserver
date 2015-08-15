import {uid} from './util';

let codes = new Map();

// consent object: cliendId, userId, redirectUri

export function create(consent) {
  let code = uid(80);
  codes.set(code, consent);
  // TODO: code should be expired after a while (10 minutes)
  return code;
}
  
export function use(code, callback) {
  // TODO: code should be marked as used, and invalidate all granted tokens if the code is attempted to be reused (rfc6749#section-10.5)
  let consent = codes.get(code);
  if (!code) {
    callback(null, null);
  } else {
    callback(null, consent);
  }
}
