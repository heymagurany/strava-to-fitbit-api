module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var serviceName = context.params.serviceName;

    if (serviceName === 'strava') {

    }
    else if (serviceName === 'fitbit') {

    }
    else {
        context.res = {
            status: 400,
            body: "The service, '" + serviceName + ",' is not supported."
        }
        context.done();
        return;
    }

    context.res = {
        status: 302,
        headers: {
            "Location": "https://strava-to-fitbit.azurewebsites.net"
        }
    };
    context.done();
};