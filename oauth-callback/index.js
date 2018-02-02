const request = require('request-promise');
const fitbit = require('../lib/fitbit');
const strava = require('../lib/strava');
const authorization = require('../lib/authorization');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = req.query.service_name;
    var code = req.query.code;
    var service;
    var user = context.user;
    
    if (!context.user) {
        context.user = {};
    }
    
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
        user[serviceName] = userId;
        context.res = authorization.setToken(user, {
            status: 302,
            headers: {
                'Location': 'https://strava-to-fitbit.azurewebsites.net'
            },
            body: ''
        });
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
};
