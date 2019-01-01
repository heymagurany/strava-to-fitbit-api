const store = require('../lib/store');
const strava = require('../lib/strava');
const fitbit = require('../lib/fitbit');

module.exports = function (context) {
    const event = context.bindings.stravaEvent;

    context.log('Processing a Strava event.\n' + JSON.stringify(event));

    store.getUserToken(event.userId).then((user) => {
        context.log('Fetched user token');
        
        const stravaApi = strava.fromUser(user);
        const fitbitApi = fitbit.fromUser(user);

        context.log('Strava API: ' + stravaApi);
        
        return stravaApi.getActivity(event.activityId).then((stravaActivity) => {
            context.log('Fetched strava activity.\n' + JSON.stringify(stravaActivity));

            // TODO: Check if activity was already logged
            // TODO: Map Strava activity types to Fitbit activity types
            // TODO: Log activity
            // return fitbitApi.logActivity({
                
            // })
            // TODO: Save activity IDs to storage
        });
    }).catch((error) => {
        context.log('Failed to log activity to Fitbit.\n' + error);
    }).finally(() => {
        context.done()
    });
};