var request = require('request-promise');
var Base64 = require('js-base64').Base64;
var store = require('../lib/store');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = req.query.service_name;
    var code = req.query.code;
    var promise;
    
    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        promise = requestToken('https://api.fitbit.com/oauth2/token', process.env['FITBIT_CLIENT_ID'], process.env['FITBIT_CLIENT_SECRET'], code, serviceName)
        .then((result) => {
            context.log('Saving tokens for Fitbit user, "' + result.user_id + '."');
    
            return store.addTokens(serviceName, result.user_id, result.access_token, result.refresh_token);
        });
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

function requestToken(url, clientId, clientSecret, code, serviceName) {
    return request({
        method: 'POST',
        uri: url,
        headers: {
            'Authorization': 'Basic ' + Base64.encode(clientId + ':' + clientSecret)
        },
        form: {
            code: code,
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: 'https://strava-to-fitbit.azurewebsites.net/oauth/callback/' + serviceName
        },
        json: true
    });
}