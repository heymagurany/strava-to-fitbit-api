const Base64 = require('js-base64').Base64;
const request = require('request-promise');
const env = require('./environment');

const baseUrl = 'https://api.fitbit.com';

function Fitbit(userId, accessToken, refreshToken) {
  this.userId = userId;
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
}

Fitbit.prototype.logActivity = function (activity) {
  return request({
    method: 'POST',
    uri: baseUrl + '/1/user/-/activities.json',
    headers: {
      'Authorization': 'Bearer ' + this.accessToken
    },
    nody: activity,
    json: true
  });
}

function fromAuthorizationCode(code) {
  return request({
    method: 'POST',
    uri: baseUrl + '/oauth2/token',
    headers: {
      'Authorization': 'Basic ' + Base64.encode(env.fitbitClientId + ':' + env.fitbitClientSecret)
    },
    form: {
      code: code,
      grant_type: 'authorization_code',
      client_id: env.fitbitClientId,
      redirect_uri: 'https://strava-to-fitbit.azurewebsites.net/oauth/callback/fitbit'
    },
    json: true
  }).then((result) => {
    return new Fitbit(result.user_id, result.access_token, result.refresh_token);
  });
}

function fromUser(user) {
  return new Fitbit(user.fitbit.userId, user.fitbit.accessToken, user.fitbit.refreshToken);
}

module.exports = {
  fromAuthorizationCode: fromAuthorizationCode,
  fromUser: fromUser
};
