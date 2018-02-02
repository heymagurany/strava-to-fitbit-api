const crypto = require('crypto');
const authorization = require('../lib/authorization');
const env = require('../lib/environment');

const { test } = QUnit;

env.authTokenSecret = 'a secret';

test('sets the token in the response', (assert) => {
  assert.expect(1);

  var res = {
    headers: {}
  };

  authorization.setToken({
    fitbit: '1234',
    strava: 'abcd'
  }, res);

  assert.ok(res.headers['Set-Cookie']);
});

test('a cookie with the auth token is validated', (assert) => {
  assert.expect(2);

  var done = assert.async();
  var token = 'fitbit=1234&strava=abcd';
  var hmac = crypto.createHmac('sha256', env.authTokenSecret);
  hmac.update(token);
  var context = {
    done: done
  };  
  var req = {
    cookies: {
      auth: encodeURIComponent(token + '&hmacsha256=' + hmac.digest('base64'))
    }
  };

  authorization.authorized(function (context, req) {
    assert.equal(context.user.fitbit, '1234');
    assert.equal(context.user.strava, 'abcd');
    done();
  })(context, req);
});
