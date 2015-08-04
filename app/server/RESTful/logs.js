var LogCollections = {};

var getLogCollection = function(deviceid, packageName, returnObject) {
  var length = LogCollections._length || 0;
  var collection = initCollection(LogCollections, deviceid + '_' + packageName, 'log');
  if (LogCollections._length > length) {
    var packageIndexCollection = initCollection(LogCollections, packageName, 'log_package_index');
    var deviceIndexCollection = initCollection(LogCollections, deviceid, 'log_device_index');
    if (!updateToIndexCollection(deviceid, Devices, 'logIndexCollection', deviceIndexCollection._name)) {
      returnObject.statusCode = 403;
      returnObject.body = {error: 'deviceid: ' + deviceid + ' is not valid!'};
      return undefined;
    }
    if (!updateToIndexCollection(packageName, MetaData, 'logIndexCollection', packageIndexCollection._name)) {
      returnObject.statusCode = 403;
      returnObject.body = {error: 'packageName: ' + packageName + ' is not valid!'};
      return undefined;
    }
    try {
      // DONE: inform package have such device
      if (!packageIndexCollection.findOne(deviceid)) {
        packageIndexCollection.insert({_id: deviceid, actualCollection: collection._name});
      }
      // DONE: inform device have such package
      if (!deviceIndexCollection.findOne(packageName)) {
        deviceIndexCollection.insert({_id: packageName, actualCollection: collection._name});
      }
    } catch (e) {
      console.log(e);
    }
  }
  return collection;
};

var insertToLogCollection = function(obj, logCollection) {
  // DONE: validation format
  // the obj should have:
  // 1. timestamp, timestamp
  // 2. label, label
  // 3. logObject, logObject

  if (obj.timestamp === undefined) {
    return false;
  }
  if (obj.label === undefined) {
    return false;
  }
  if (obj.logObject === undefined) {
    return false;
  }

  // DONE: insert obj to logCollection
  // add _timestamp when insert to log
  obj._timestamp = new Date().valueOf();
  logCollection.insert(obj);
  return true;
};

addLogs = function(maybeAPIv1) {
  maybeAPIv1.addCollection(Logs, 'logs', {
    authToken: undefined,
    methods: ['POST'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        debug('POST log: ' + JSON.stringify(obj) + ' with: ' + JSON.stringify(requestMetadata));
        returnObject.success = true;
        // returnObject.statusCode = 400;
        // returnObject.body = {};
        var deviceid = requestMetadata.collectionId;
        if (deviceid === undefined) {
          // DONE: tell that we need device id
          returnObject.statusCode = 403;
          returnObject.body = {error: 'need deviceid in url!'};
          return true;
        }
        var fields = requestMetadata.fields;
        if (fields.length === 0) {
          // DONE: tell that we need package name
          returnObject.statusCode = 403;
          returnObject.body = {error: 'need package name in url!'};
          return true;
        }
        var packageName = fields[0];

        // DONE: get log collection, per device per package should have a collection.
        // DONE: check whether deviceid and package exist.
        var logCollection = getLogCollection(deviceid, packageName, returnObject);
        if (logCollection === undefined) {
          return true;
        }

        var array = obj.constructor === Array && obj || [obj];

        // DONE: insert to collection, then return success code
        try {
          // DONE: bunch insert
          for (var i in array) {
            if (!insertToLogCollection(array[i], logCollection)) {
              returnObject.statusCode = 403;
              returnObject.body = {error: JSON.stringify(array[i]) + ' is not valid!'};
              return true;
            }
          }
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
          return true;
        }

        // return empty jsonObject indicate everything is good.
        // return {error: 'something wrong!'} to indicate there're errors
        returnObject.statusCode = 201;
        returnObject.body = {};
        return true;
      }
    }
  });
};
