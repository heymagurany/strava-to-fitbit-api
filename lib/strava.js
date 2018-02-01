var store = require('./store');
var request = require('request-promise');
var env = require('../lib/environment');

var baseUrl = 'https://www.strava.com';

function Strava(userId, accessToken) {
  this.userId = userId;
  this.accessToken = accessToken;
}

function saveAuthorization(code) {
  return request({
      method: 'POST',
      uri: baseUrl + '/oauth/token',
      form: {
          code: code,
          client_id: env.stravaClientId,
          client_secret: env.stravaClientSecret
      },
      json: true
  })
  .then((result) => {
      return store.addTokens('strava', result.athlete.id, result.access_token);
  });
}

module.exports = {
  saveAuthorization: saveAuthorization
};
