const authorization = require('../lib/authorization');
const env = require('../lib/environment');

module.exports = authorization.withUserContext((context, req) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    var user = context.user;
    var serviceName = req.query.service_name;
    var code = req.query.code;
    var service;

    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        if (!user.id) {
            context.res = {
                status: 400,
                body: 'Strava must be connected first.'
            }
            context.done();
            return;
        }

        service = require('../lib/fitbit');
    }
    else if (serviceName === 'strava') {
        context.log('This is an OAuth callback for Strava.');

        service = require('../lib/strava');
    }
    else {
        context.res = {
            status: 400,
            body: 'The service, "' + serviceName + '", is not supported.'
        }
        context.done();
        return;
    }

    service.fromAuthorizationCode(code).then((result) => {
        context.log('Got token from service, "' + serviceName + '."');

        user[serviceName] = {
            userId: result.userId,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        };
        
        context.res = {
            status: 302,
            headers: {
                'Location': env.uiUrl
            },
            body: ''
        };

        return authorization.setToken(user, context.res).then(() => {
            context.log('Saved token.');
        });
    }).catch((error) => {
        context.log('Error saving token:\n' + error);
        context.res = {
            status: 500,
            body: error
        };
    }).finally(() => {
        context.done();
    });
});
