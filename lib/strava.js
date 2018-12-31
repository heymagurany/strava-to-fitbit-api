const request = require('request-promise');
const env = require('../lib/environment');

const baseUrl = 'https://www.strava.com';

function Strava(userId, accessToken) {
  this.userId = userId;
  this.accessToken = accessToken;
}

function fromAuthorizationCode(code) {
  return request({
    method: 'POST',
    uri: baseUrl + '/oauth/token',
    form: {
      code: code,
      client_id: env.stravaClientId,
      client_secret: env.stravaClientSecret
    },
    json: true
  }).then((result) => {
    return new Strava(result.athlete.id.toString(), result.access_token);
  });
}

module.exports = {
  fromAuthorizationCode: fromAuthorizationCode
};
