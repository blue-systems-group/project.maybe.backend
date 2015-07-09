var LogCollections = {};

var getLogCollection = function(deviceid, packageName) {
  var length = LogCollections._length || 0;
  var collection = initCollection(LogCollections, deviceid + '_' + packageName, 'log');
  if (LogCollections._length > length) {
    var packageIndexCollection = initCollection(LogCollections, packageName, 'log_package_index');
    var deviceIndexCollection = initCollection(LogCollections, deviceid, 'log_device_index');
    try {
      // DONE: inform package have such device
      if (!packageIndexCollection.findOne(deviceid)) {
        packageIndexCollection.insert({_id: deviceid});
      }
      // DONE: inform device have such package
      if (!deviceIndexCollection.findOne(packageName)) {
        deviceIndexCollection.insert({_id: packageName});
      }
    } catch (e) {
      console.log(e);
    }
  }
  return collection;
};

var insertToLogCollection = function(obj, logCollection) {
  // TODO: insert obj to logCollection
  // need validate obj
  // need try catch and error handle.
  return true;
};

addLogs = function(maybeAPIv1) {
  maybeAPIv1.addCollection(Logs, 'logs', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        debug('POST log: ' + JSON.stringify(obj) + ' with: ' + JSON.stringify(requestMetadata));
        returnObject.success = true;
        // returnObject.statusCode = 400;
        // returnObject.body = {};
        var deviceid = requestMetadata.collectionId;
        if (deviceid === undefined) {
          // TODO: tell that we need device id
          return true;
        }
        var fields = requestMetadata.fields;
        if (fields.length === 0) {
          // TODO: tell that we need package name
          return true;
        }
        var packageName = fields[0];

        // TODO: get log collection, per device per package should have a collection.
        var logCollection = getLogCollection(deviceid, packageName);


        // TODO: validation format
        // the obj should have:
        // 1. timestamp, timestamp
        // 2. label, label
        // 3. logObject, logObject

        try {
          if (obj.constructor === Array) {
            // TODO: bunch insert
            obj.forEach(function(entry) {
              console.log(entry);
              insertToLogCollection(entry, logCollection);
            });
          } else if (obj.constructor === Object) {
            if (insertToLogCollection(obj, logCollection)) {
              returnObject.statusCode = 201;
              returnObject.body = {};
            } else {
              returnObject.statusCode = 403;
              returnObject.body = {error: JSON.stringify(obj) + ' is not valid!'};
            }
          }
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
        }
        // TODO: insert to collection, then return success code

        // return empty jsonObject indicate everything is good.
        // return {error: 'something wrong!'} to indicate there're errors
        return true;


        // if (!obj.hasOwnProperty("sha224_hash")) {
        //   return false;
        // }
        // if (!obj.hasOwnProperty("label")) {
        //   return false;
        // }

        // var metaData = {
        //   deviceid: requestMetadata.collectionId,
        //   timestamp: new Date().valueOf()
        // };

        // var logEntry = {
        //   _metadata: metaData,
        //   value: obj
        // };

        // var hash = obj.sha224_hash;
        // var label = obj.label;
        // var key = hash + "_" + label;

        // if (!Logs.hasOwnProperty(key) || !Logs[key].enable) {
        //   returnObject.success = true;
        //   returnObject.statusCode = 500;
        //   var error = "";
        //   if (MetaData.findOne(hash) === undefined) {
        //     error = "No package for " + hash;
        //   } else {
        //     error = "Package " + hash  + " has no label " + label;
        //   }
        //   returnObject.body = {
        //     error: error
        //   };
        //   return true;
        // }

        // try {
        //   Logs[key].collection.insert(logEntry);
        //   returnObject.success = true;
        //   returnObject.statusCode = 201;
        //   returnObject.body = logEntry;
        // } catch (e) {
        //   returnObject.success = true;
        //   returnObject.statusCode = 500;
        //   returnObject.body = {
        //     error: e.toString()
        //   };
        // }

        // return true;
      },
      GET: function(objs, requestMetadata) {
        debug('GET');
        debug(objs);
        return true;
      },
      PUT: function(obj, newValues, requestMetadata) {
        debug('PUT');
        debug(obj);
        debug(newValues);
        debug(requestMetadata);
        return true;
      },
      DELETE: function(obj, requestMetadata) {
        debug('DEL');
        if (obj === undefined) {
          return false;
        }
        return false;
      }
    }
  });
};
