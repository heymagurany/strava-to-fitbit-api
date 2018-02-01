var request = require('request-promise');
var fitbit = require('../lib/fitbit');
var strava = require('../lib/strava');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = req.query.service_name;
    var code = req.query.code;
    var promise;
    
    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        promise = fitbit.saveTokens(code);
    }
    else if (serviceName === 'strava') {
        context.log('This is an OAuth callback for Strava.');

        promise = strava.saveTokens(code);
    }
    else {
        context.res = {
            status: 400,
            body: 'The service, "' + serviceName + '", is not supported.'
        }
        context.done();
        return;
    }

    promise.then(() => {
        context.res = {
            status: 302,
            headers: {
                'Location': 'https://strava-to-fitbit.azurewebsites.net'
            },
            body: ''
        };
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
