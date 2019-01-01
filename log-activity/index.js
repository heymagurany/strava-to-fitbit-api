const store = require('../lib/store');
const strava = require('../lib/strava');

module.exports = function (context) {
    const event = context.bindings.stravaEvent;

    context.log('Processing a Strava event.\n' + JSON.stringify(event));

    store.getUserToken(event.userId).then((user) => {
        context.log('Fetched user token');
        
        const stravaApi = strava.fromUser(user);

        context.log('Strava API: ' + stravaApi);
        
        return stravaApi.getActivity(event.activityId).then((stravaActivity) => {
            context.log('Fetched strava activity.\n' + JSON.stringify(stravaActivity));
        });
    }).catch((error) => {
        context.log('Failed to log activity to Fitbit.\n' + error);
    }).finally(() => {
        context.done()
    });
};