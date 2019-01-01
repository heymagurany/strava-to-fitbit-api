const authorization = require('../lib/authorization');
const store = require('../lib/store');
const Promise = require('bluebird');

module.exports = authorization.withUserContext((context, req) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    var user = context.user;
    var serviceName = req.query.service_name;
    var code = req.query.code;
    var promise;

    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        if (!user || !user.strava) {
            context.res = {
                status: 400,
                body: 'Strava must be connected first.'
            }
            context.done();
            return;
        }

        promise = store.getUserToken(user.strava).then((userToken) => Promise.resolve(require('../lib/fitbit'), userToken));
    }
    else if (serviceName === 'strava') {
        context.log('This is an OAuth callback for Strava.');

        promise = Promise.resolve(require('../lib/strava'), {})
    }
    else {
        context.res = {
            status: 400,
            body: 'The service, "' + serviceName + '", is not supported.'
        }
        context.done();
        return;
    }

    promise.then((service, userToken) => {
        return service.fromAuthorizationCode(code).then((result) => {
            userToken[serviceName] = {
                userId: result.userId,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }

            return store.saveUserToken(userToken).then(() => {
                if (!user) {
                    user = {};
                }

                user[serviceName] = result.userId;
                context.res = {
                    status: 302,
                    headers: {
                        // TODO: get the redirect location from the state param
                        'Location': 'https://strava-to-fitbit.azurewebsites.net'
                    },
                    body: ''
                };
                authorization.setToken(user, context.res);
            });
        });
    }).catch((error) => {
        context.log('ErrorSaving token:\n' + error);
        context.res = {
            status: 500,
            body: error
        };
    }).finally(() => {
        context.done();
    });
});
