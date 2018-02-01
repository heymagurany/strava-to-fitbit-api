var store = require('./store');

store.addTokens('test', 'test-id', 'test-access-token', 'test-refresh-token')
.finally(() => {
  process.exit(0);
});
