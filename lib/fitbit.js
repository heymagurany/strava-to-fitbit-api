var Base64 = require('js-base64').Base64;
var request = require('request-promise');
var store = require('./store');

var clientId = process.env['FITBIT_CLIENT_ID'];
var clientSecret = process.env['FITBIT_CLIENT_SECRET'];
var baseUrl = 'https://api.fitbit.com';

function Fitbit(userId, accessToken, refreshToken) {
  this.userId = userId;
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
}

function saveAuthorization(code) {
  return request({
      method: 'POST',
      uri: baseUrl + '/oauth2/token',
      headers: {
          'Authorization': 'Basic ' + Base64.encode(clientId + ':' + clientSecret)
      },
      form: {
          code: code,
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: 'https://strava-to-fitbit.azurewebsites.net/oauth/callback/fitbit'
      },
      json: true
  })
  .then((result) => {
      return store.addTokens('fitbit', result.user_id, result.access_token, result.refresh_token);
  });
}

function create(userId) {
  // TODO: return a promise of a Fitbit object after fetching tokens from the store
}

module.exports = {
  saveAuthorization: saveAuthorization,
  create: create
};
