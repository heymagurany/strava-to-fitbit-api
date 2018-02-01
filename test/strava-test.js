var strava = require('../lib/strava');
var nock = require('nock');
var env = require('../lib/environment');

env.tableStorageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=test-account-name;AccountKey=abcd;EndpointSuffix=core.windows.net';
env.stravaClientId = 'test-client-id';
env.stravaClientSecret = 'test-client-secret';

nock('https://www.strava.com')
  .post('/oauth2/token', 'code=test&client_id=test-client-id&client_secret=test-client-secret')
  .reply(200, {
    access_token: 'test-token',
    athlete: {
      id: 'test-user-id'
    }
  });

nock('https://test-account-name.table.core.windows.net')
  .get(/\/Tables.*/)
  .reply(404, {
    error: {
      statusCode: 204
    }
  });

nock('https://test-account-name.table.core.windows.net')
  .post('/Tables')
  .reply(204, {
    error: false,
    response: {
      statusCode: 204
    }
  });

strava.saveAuthorization('test')
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    process.exit(0);
  });
