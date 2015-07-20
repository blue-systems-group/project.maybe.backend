var DeviceCollections = {};

initDeviceCollection = function(key) {
  return initCollection(DeviceCollections, key, 'device');
};

addDevices = function(maybeAPIv1) {
  maybeAPIv1.addCollection(Devices, 'devices', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        // rquire deviceid
        // optional gcmid
        returnObject.success = true;
        debug('POST device: ' + JSON.stringify(obj));

        if (obj === undefined) {
          returnObject.statusCode = 400;
          returnObject.body = {error: 'your format is unsupported, only support json!'};
          return true;
        } else if (obj.deviceid === undefined) {
          returnObject.statusCode = 400;
          returnObject.body = {error: JSON.stringify(obj) + ' have no deviceid!'};
          return true;
        }

        if (!insertToIndexCollection(obj.deviceid, Devices, false, returnObject)) {
          return true;
        }

        try {
          var collection = initDeviceCollection(obj.deviceid);

          updateToIndexCollection(obj.deviceid, Devices, 'actualCollection', collection._name);

          var newRecord = addDeviceToCollection(obj, collection);

          var packageList = getPackageList();

          var deviceIndex = Devices.findOne(obj.deviceid);
          var device = updateOneDevice(deviceIndex, packageList);

          returnObject.statusCode = 201;
          returnObject.body = requestMetadata.query && requestMetadata.query.callback === "0" && {} || device;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
        }
        return true;
      },
      GET: function(objs, requestMetadata, returnObject) {
        // DONE: generate choices for all packages, labels
        // each device has version number for metadata index collection.
        // if the version number is less than metadata version, do update its choices
        returnObject.success = true;

        debug('GET device(s): ' + JSON.stringify(requestMetadata));
        objs = filterDeleted(objs, returnObject);
        if (objs.length === 0) {
          return true;
        }

        try {
          var packageList = getPackageList();

          var fields = requestMetadata.fields;

          var deviceList = [];
          objs.forEach(function(deviceIndex) {
            var device = updateOneDevice(deviceIndex, packageList);
            deviceList.push(device);
          });
          returnObject.statusCode = 200;
          returnObject.body = deviceList;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
        }
        return true;

        // TODO: handle only query one pacakge
        // if (requestMetadata.collectionId && requestMetadata.fields && requestMetadata.fields.length > 0 && objs.length === 1) {
        //   var fields = requestMetadata.fields;
        //   var deviceIndex = objs[0];

        //   updateOneDevice(deviceIndex, packageList);

        //   var choices = device.choices;
        //   var targetPackage = fields[0];
        //   if (!choices.hasOwnProperty(targetPackage )) {
        //     returnObject.statusCode = 500;
        //     returnObject.body = {
        //       error: "device " + device._id + " doesn't have package: " + targetPackage
        //     };
        //     return true;
        //   }

        //   if (fields.length == 1) {
        //     returnObject.statusCode = 200;
        //     returnObject.body = choices[targetPackage];
        //     return true;
        //   }

        //   var label = fields.slice(1).join(" ");
        //   var choice = choices[targetPackage];
        //   var labels = choice.labels;
        //   if (!label || !choice || !labels || labels.length === 0) {
        //     returnObject.statusCode = 500;
        //     returnObject.body = {
        //       error: "device " + requestMetadata.collectionId + " with " + sha224_hash + " have something wrong!"
        //     };
        //     return true;
        //   }

        //   labels.forEach(function(oneLabel) {
        //     if (oneLabel.label === label) {
        //       returnObject.statusCode = 200;
        //       returnObject.body = oneLabel;
        //     }
        //   });

        //   if (!returnObject.statusCode) {
        //     returnObject.statusCode = 500;
        //     returnObject.body = {
        //       error: "device " + requestMetadata.collectionId + " with " + sha224_hash + " doesn't have label: " + label
        //     };
        //   }

        //   return true;
        // }

        // objs.forEach(function(device) {
        //   updateOneDevice(device, packageList);
        //   if (device.hasOwnProperty('_id')) {
        //     delete device['_id'];
        //   }
        // });
      },
      PUT: function(obj, newValues, requestMetadata, returnObject) {
        // DONE: only allow for gcmid
        debug('PUT for device: ' + JSON.stringify(obj) + ' with: ' + JSON.stringify(newValues));

        returnObject.success = true;
        if (obj === undefined || obj.deleted === true) {
          returnObject.statusCode = 404;
          returnObject.body = {error: requestMetadata.collectionId + ' not found!'};
          return true;
        }

        if (!newValues.hasOwnProperty('gcmid')) {
          returnObject.statusCode = 403;
          returnObject.body = {error: 'only gcmid is allowed for PUT!'};
          return true;
        }

        try {
          var collection = initDeviceCollection(obj._id);
          var current = collection.findOne('0');
          var device = current.device;
          device.gcmid = newValues.gcmid;
          collection.update(current._id, current);

          returnObject.statusCode = 202;
          returnObject.body = requestMetadata.query && requestMetadata.query.callback === "0" && {} || device;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
        }
        return true;
      },
      DELETE: function(obj, requestMetadata, returnObject) {
        returnObject.success = true;
        debug('DEL device: ' + obj._id);
        delFromIndexCollection(obj, Devices, returnObject);
        return true;
      }
    }
  });
};

Meteor.publish('getDeviceCollection', function(collectionName) {
  return getCollection(collectionName).find();
});
