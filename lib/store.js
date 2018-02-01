var azure = require('azure-storage');
var Promise = require('bluebird');
var env = require('./environment');

var entGen = azure.TableUtilities.entityGenerator;
var userTokenTableName = 'UserToken';

function addTokens(serviceName, userId, accessToken, refreshToken) {
  var tableService = azure.createTableService(env.tableStorageConnectionString);

  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(userTokenTableName, (error, result, response) => {
      if (error) {
        reject(error, response);
      }
      else {
        resolve(result, response);
      }
    });
  })
  .then((result) => new Promise((resolve, reject) => {
    var entity = {
      PartitionKey: entGen.String(serviceName),
      RowKey: entGen.String(userId),
      accessToken: entGen.String(accessToken),
      refreshToken: entGen.String(refreshToken)
    };
    
    tableService.insertOrReplaceEntity(userTokenTableName, entity, (error, result, response) => {
      if (error) {
        reject(error, response);
      }
      else {
        resolve(result, response);
      }
    });
  }))
  .then((result) => null);
}

module.exports = {
  addTokens: addTokens
};