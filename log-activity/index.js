const store = require('../lib/store');
const strava = require('../lib/strava');

module.exports = function (context, message) {
    let event = context.bindings.stravaEvent;
    let userId = event.owner_id;

    context.log('Processing a Strava event. ' + event);

    store.getUserToken(userId).then((user) => {
        context.log('Fetched user token');
        let stravaApi = strava.fromUser(user);
    }).finally(() => {
        context.done()
    });;
};