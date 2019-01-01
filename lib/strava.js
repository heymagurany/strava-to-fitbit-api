const request = require('request-promise');
const env = require('../lib/environment');

const baseUrl = 'https://www.strava.com';

function Strava(userId, accessToken, refreshToken) {
  this.userId = userId;
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
}

Strava.prototype.getActivity = function (activityId) {
  return request({
    method: 'GET',
    uri: baseUrl + '/api/v3/activities/' + activityId,
    headers: {
      'Authorization': 'Bearer ' + this.accessToken
    },
    json: true,
    resolveWithFullResponse: true
  });
}

function fromAuthorizationCode(code) {
  return request({
    method: 'POST',
    uri: baseUrl + '/oauth/token',
    form: {
      grant_type: 'authorization_code',
      code: code,
      client_id: env.stravaClientId,
      client_secret: env.stravaClientSecret
    },
    json: true
  }).then((result) => {
    return new Strava(result.athlete.id, result.access_token, result.refresh_token);
  });
}

function fromUser(user) {
  return new Strava(user.strava.userId, user.strava.accessToken, user.strava.refreshToken);
}

module.exports = {
  fromAuthorizationCode: fromAuthorizationCode,
  fromUser: fromUser
};
