var store = require('./store');
var request = require('request-promise');

var clientId = process.env['STRAVA_CLIENT_ID'];
var clientSecret = process.env['STRAVA_CLIENT_SECRET'];
var baseUrl = 'https://www.strava.com';

function Strava(userId, accessToken) {
  this.userId = userId;
  this.accessToken = accessToken;
}

function saveAuthorization(code) {
  return request({
      method: 'POST',
      uri: baseUrl + '/oauth2/token',
      form: {
          code: code,
          client_id: clientId,
          client_secret: clientSecret
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
