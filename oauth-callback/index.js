const authorization = require('../lib/authorization');
const store = require('../lib/store');

module.exports = authorization.withUserContext((context, req) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    var user = context.user;
    var userToken;
    var serviceName = req.query.service_name;
    var code = req.query.code;
    var service;
    
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

        userToken = store.getUserToken(user.strava);
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

    service.fromAuthorizationCode(code)
    .then((result) => {

        if (!userToken) {
            userToken = {
                [serviceName]: {
                    userId: result.userId,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            };
        }
        store.saveUserToken(userToken);
        
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
    })
    .catch((error) => {
        context.log('ErrorSaving token:\n' + error);
        context.res = {
            status: 500,
            body: error
        };
    })
    .finally(() => {
        context.done();
    });
});
