const crypto = require('crypto');
const env = require('./environment');

const separator = '&hmacsha256=';

function authorized(callback) {
  return (context, req) => {
    var authCookie = req.cookies.auth;

    if (authCookie) {
      var pairs = decodeURIComponent(authCookie).split(separator, 2);

      if (pairs.length === 2) {
        if (hmac(pairs[0]) === pairs[1]) {
          context.user = pairs[0].split('&').reduce((result, pair) => {
            var index = pair.indexOf('=');

            result[decodeURIComponent(pair.substring(0, index))] = decodeURIComponent(pair.substring(index + 1));

            return result;
          }, {});

          callback(context, req);
          return;
        }
      }
    }
    
    context.res = {
      status: 401,
      body: ''
    }
    context.done();
  };
}

function setToken(user, res) {
  var encoded = Object.keys(user).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(user[key])).join('&');
  
  res.headers['Set-Cookie'] = encodeURIComponent(encoded + separator + hmac(encoded));
}

function hmac(value) {
  var hmac = crypto.createHmac('sha256', env.authTokenSecret);
  hmac.update(value);

  return hmac.digest('base64');
}

module.exports = {
  authorized: authorized,
  setToken: setToken
};
