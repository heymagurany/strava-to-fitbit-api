const request = require('request-promise');
const fitbit = require('../lib/fitbit');
const strava = require('../lib/strava');
const authorization = require('../lib/authorization');

module.exports = authorization.withUserContext((context, req) => {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log(context.user);

    var serviceName = req.query.service_name;
    var code = req.query.code;
    var service;
    
    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        service = fitbit;
    }
    else if (serviceName === 'strava') {
        context.log('This is an OAuth callback for Strava.');

        service = strava;
    }
    else {
        context.res = {
            status: 400,
            body: 'The service, "' + serviceName + '", is not supported.'
        }
        context.done();
        return;
    }

    service.saveAuthorization(code)
    .then((userId) => {
        var user = context.user;
        
        if (!user) {
            user = {};
        }
        
        user[serviceName] = userId;
        context.res = {
            status: 302,
            headers: {
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
