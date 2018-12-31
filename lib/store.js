const azure = require('azure-storage');
const Promise = require('bluebird');
const env = require('./environment');

const entGen = azure.TableUtilities.entityGenerator;
const userTokenTableName = 'UserToken';

function tableService() {
  var tableService = azure.createTableService(env.tableStorageConnectionString);

  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(userTokenTableName, (error) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(tableService);
      }
    });
  });
}

function getUserToken(stravaUserId) {
  return tableService()
  .then((tableService) => {
    return new Promise((resolve, reject) => {
      tableService.retrieveEntity(userTokenTableName, stravaUserId, stravaUserId, (error, result) => {
        if (error) {
          reject(error);
        }
        else {
          resolve({
            strava: {
              userId: result.RowKey,
              accessToken: result.StravaAccessToken
            },
            fitbit: {
              userId: result.FitbitUserId,
              accessToken: result.FitbitAccessToken,
              refreshToken: result.FitbitRefreshToken
            }
          });
        }
      })
    });
  });
}

function saveUserToken(user) {
  return tableService()
  .then((tableService) => new Promise((resolve, reject) => {
    var entity = {
      PartitionKey: entGen.String(user.strava.userId),
      RowKey: entGen.String(user.strava.userId),
      StravaAccessToken: entGen.String(user.strava.accessToken),
      FitbitUserId: entGen.String(user.fitbit.userId),
      FitbitAccessToken: entGen.String(user.fitbit.accessToken),
      FitbitRefreshToken: entGen.String(user.fitbit.refreshToken)
    };
    
    tableService.insertOrReplaceEntity(userTokenTableName, entity, (error) => {
      if (error) {
        reject(error);
      }
      else {
        resolve();
      }
    });
  }));
}

module.exports = {
  getUserToken: getUserToken,
  saveUserToken: saveUserToken
};