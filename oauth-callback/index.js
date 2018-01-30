var request = require('request-promise');
var Base64 = require('js-base64').Base64;

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = req.query.service_name;
    var code = req.query.code;
    var promise;
    
    // if (serviceName === 'strava') {
    //     context.log('This is an OAuth callback for Strava.');
    // }
    // else
    if (serviceName === 'fitbit') {
        context.log('This is an OAuth callback for Fitbit.');

        promise = requestToken('https://api.fitbit.com/oauth2/token', process.env['FITBIT_CLIENT_ID'], process.env['FITBIT_CLIENT_SECRET'], code, serviceName)
        .then((response) => {
            return {
                fitbitUserId: response.user_id,
                fitbitAccessToken: response.access_token,
                fitbitRefreshToken: response.refresh_token
            };
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

    promise.then((data) => {
        context.res = {
            status: 302,
            headers: {
                'Location': 'https://strava-to-fitbit.azurewebsites.net?fid=' + data.fitbitUserId
            },
            body: ''
        };
    })
    .catch((error) => {
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
            Authorization: 'Basic ' + Base64.encode(clientId + ':' + clientSecret)
        },
        formData: {
            code: code,
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: 'https://strava-to-fitbit.azurewebsites.net/oauth/callback/' + serviceName
        },
        json: true
    });
}