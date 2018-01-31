var azure = require('azure-storage');
var Promise = require('bluebird');

var tableService = azure.createTableService();
var entGen = azure.TableUtilities.entityGenerator;
var userTokenTableName = 'user-token';

function addTokens(serviceName, userId, accessToken, refreshToken) {
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
      refreshToken: engGen.String(refreshToken)
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