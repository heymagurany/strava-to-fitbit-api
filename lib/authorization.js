const crypto = require('crypto');
const env = require('./environment');
const store = require('./store');

const separator = 'hmacsha256';

function authorized(callback) {
  return withUserContext((context, req) => {
    var user = context.user;
    
    if (hmac(user.id) === user[separator]) {
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
    let cookies = req.headers['cookie'] || req.headers['Cookie'];
    let auth;

    if (cookies) {
      cookies = cookies.split(';');

      cookies.forEach(cookie => {
        cookie = cookie.split('=');

        if (cookie.length > 1 && cookie[0] === 'auth') {
          var pairs = decodeURIComponent(cookie[1]).split('&');
    
          if (pairs.length > 0) {
            auth = pairs.reduce((result, pair) => {
              var index = pair.indexOf('=');
    
              result[decodeURIComponent(pair.substring(0, index))] = decodeURIComponent(pair.substring(index + 1));
    
              return result;
            }, {});
          }
        }
      });
    }

    if (auth && auth.id) {
      store.getUserToken(auth.id).then((userToken) => {
        context.user = Object.assign(auth, userToken);
        callback(context, req);
      });
    }
    else {
      context.user = {};
      callback(context, req);
    }
  };
}

function setToken(user, res) {
  return store.saveUserToken(user).then(() => {
    let auth = {
      id: user.strava.userId
    };
    auth[separator] = encodeURIComponent(hmac(auth.id));
    var encoded = Object.keys(auth).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(auth[key]));
    
    res.headers['Set-Cookie'] = `auth=${encodeURIComponent(encoded.join('&'))}; HttpOnly; Secure`;
  });
}

function hmac(userId) {
  var hmac = crypto.createHmac('sha256', env.authTokenSecret);
  hmac.update(userId.toString());

  return hmac.digest('base64');
}

module.exports = {
  authorized: authorized,
  withUserContext: withUserContext,
  setToken: setToken
};
