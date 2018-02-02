const crypto = require('crypto');
const env = require('./environment');

const separator = 'hmacsha256';

function authorized(callback) {
  return withUserContext((context, req) => {
    var user = context.user;
    
    if (hmac(user) === user[separator]) {
      callback(context, req);
    }
    else {
      context.res = {
        status: 401,
        body: ''
      }
      context.done();
    }
  });
}

function withUserContext(callback) {
  return (context, req) => {
    var cookies = req.headers['Cookie'];
    var auth;

    if (cookies) {
      cookies = cookies.split(';')

      cookies.forEach(cookie => {
        cookie = cookie.split('=');

        if (cookie.length > 1 && cookie[0] === 'auth') {
          var pairs = decodeURIComponent(cookie[1]).split('&');
    
          if (pairs.length > 0) {
            context.user = pairs.reduce((result, pair) => {
              var index = pair.indexOf('=');
    
              result[decodeURIComponent(pair.substring(0, index))] = decodeURIComponent(pair.substring(index + 1));
    
              return result;
            }, {});
          }
        }
      });
    }

    callback(context, req);
  };
}

function setToken(user, res) {
  var encoded = Object.keys(user).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(user[key]));
  encoded.push(separator + '=' + encodeURIComponent(hmac(user)));
  
  res.headers['Set-Cookie'] = `auth=${encodeURIComponent(encoded.join('&'))}; HttpOnly; Secure`;
}

function hmac(user) {
  var plaintext = Object.keys(user).reduce((result, key) => key !== separator ? result + key + user[key] : result, '');
  var hmac = crypto.createHmac('sha256', env.authTokenSecret);
  hmac.update(plaintext);

  return hmac.digest('base64');
}

module.exports = {
  authorized: authorized,
  withUserContext: withUserContext,
  setToken: setToken
};
