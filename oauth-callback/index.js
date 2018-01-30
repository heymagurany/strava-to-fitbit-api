module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = context.query[service-name];
    
    if (serviceName === strava) {
        context.log('This is an OAuth callback for Strava.');
    }
    else if (serviceName === fitbit) {
        context.log('This is an OAuth callback for Fitbit.');
    }
    else {
        context.res = {
            status: 400,
            body: 'The service, "' + serviceName + '", is not supported.'
        }
        context.done();
        return;
    }

    context.res = {
        status: 302,
        headers: {
            "Location": 'https://strava-to-fitbit.azurewebsites.net'
        }
    };
    context.done();
};
