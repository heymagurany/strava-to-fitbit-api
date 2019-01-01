const azure = require('azure-storage');
const Promise = require('bluebird');
const env = require('./environment');

const entGen = azure.TableUtilities.entityGenerator;
const userTokenTableName = 'UserToken';

function value(property) {
  if (property) {
    return property._;
  }
  return null;
}

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
      tableService.retrieveEntity(userTokenTableName, stravaUserId.toString(), stravaUserId.toString(), (error, result) => {
        if (error) {
          reject(error);
        }
        else {
          resolve({
            strava: {
              userId: parseInt(value(result.RowKey)),
              accessToken: value(result.StravaAccessToken),
              refreshToken: value(result.StravaRefreshToken)
            },
            fitbit: {
              userId: value(result.FitbitUserId),
              accessToken: value(result.FitbitAccessToken),
              refreshToken: value(result.FitbitRefreshToken)
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
      PartitionKey: entGen.String(user.strava.userId.toString()),
      RowKey: entGen.String(user.strava.userId.toString()),
      StravaAccessToken: entGen.String(user.strava.accessToken),
      StravaRefreshToken: entGen.String(user.strava.refreshToken)
    };

    if (user.fitbit) {
      entity.FitbitUserId = entGen.String(user.fitbit.userId);
      entity.FitbitAccessToken = entGen.String(user.fitbit.accessToken);
      entity.FitbitRefreshToken = entGen.String(user.fitbit.refreshToken);
    }
    
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