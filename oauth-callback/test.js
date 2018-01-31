var oauthCallback = require('./index');

var context = {
  log: function (message) {
    console.log(message);
  },
  done: function () {
    console.log('=== function complete ===')
    console.log(context.res);
    
    process.exit(0);
  }
};
var req = {
  query: {
    service_name: process.argv[2],
    code: process.argv[3]
  }
};

console.log('=== function start ===')

oauthCallback(context, req);
