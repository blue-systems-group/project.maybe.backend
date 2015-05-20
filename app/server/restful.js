var Logs = {};
var PackageCollections = {};
var DeviceCollections = {};

function decodeDotForDevice(device) {
  var choices = device.choices;
  var newChoices = {};
  if (choices !== undefined) {
    for (var packageName in choices) {
      debug(packageName);
      debug(dotDecode(packageName));
      if (choices.hasOwnProperty(packageName)) {
        newChoices[dotDecode(packageName)] = choices[packageName];
      }
    }
    device.choices = newChoices;
  }
};

function getMinChoice(statement, choiceCount) {
  var minChoice = statement.choice;
  var minCount = Number.MAX_VALUE;
  Object.keys(choiceCount).map(function(key) {
    if (choiceCount[key] < minCount) {
      minChoice = key;
    }
  });
  choiceCount[minChoice] = choiceCount[minChoice] + 1;
  debug("choice is " + minChoice);
  debug("count " + choiceCount[minChoice]);
  debug(choiceCount);
  return minChoice;
};

function initPackageCollection(key) {
  return initCollection(PackageCollections, key, 'package');
}

function initDeviceCollection(key) {
  return initCollection(DeviceCollections, key, 'device');
}

function initCollection(map, key, prefix) {
  prefix = prefix || 'noprefix';
  key = prefix + '_' + key;
  try {
    if (!map.hasOwnProperty(key)) {
      debug('create Collection: ' + key);
      map[key] = {
        enable: true,
        collection: new Meteor.Collection(key)
      };
    } else {
      if (map[key].enable === false) {
        debug('enable Collection: ' + key);
        map[key].enable = true;
      }
    }
  } catch (e) {
    debug(e.toString());
  }
  return map[key].collection;
}

function staleData(collection) {
  var current = collection.findOne('0');
  if (current !== undefined) {
    collection.remove(current);

    current._id = current._version.toString();
    current._dumpAt = new Date();

    collection.insert(current);
  }
  return current;
}

function getPackageList() {
  var packageList = [];
  var packageIndexList = MetaData.find({deleted: false}).fetch();
  packageIndexList.forEach(function(packageIndex) {
    var collection = initPackageCollection(packageIndex._id);
    var record = collection.findOne('0');
    packageList.push(record);
  });
  return packageList;
}

function addDeviceToCollection(obj, collection) {
  var current = staleData(collection);
  var version = 1;
  if (current !== undefined) {
    version += current._version;
  }

  var newDevice = {device: obj};
  newDevice._version = version;
  newDevice._id = '0';
  newDevice.queryCount = 0;
  collection.insert(newDevice);
  return obj;
}

function addMetadataToCollection(obj, collection) {
  var statements = {};
  obj.statements.forEach(function(oneStatement) {
    statements[oneStatement.label] = oneStatement;
  });
  obj.statements = statements;
  var newPackage = {
    package: obj
  };

  var current = staleData(collection);
  var version = 1;
  if (current !== undefined) {
    version += current._version;
  }

  newPackage._version = version;
  newPackage._id = '0';
  collection.insert(newPackage);

  return obj;
}

function insertToIndexCollection(id, collection, allowDuplicated, returnObject) {
  try {
    var record = collection.findOne(id);
    if (record === undefined) {
      collection.insert({_id: id, deleted: false});
      return true;
    } else {
      if (record.deleted) {
        record.deleted = false;
        collection.update(record._id, record);
        return true;
      } else {
        if (!allowDuplicated) {
          debug(id + ' has not deletes yet');
          returnObject.statusCode = 409;
          returnObject.body = {error: record._id + ' conflict!'};
          return false;
        }
      }
    }
  } catch (e) {
    debug(e.toString());
    returnObject.statusCode = 500;
    returnObject.body = {error: e.toString()};
    return false;
  }
  return true;
}

function delFromIndexCollection(obj, collection, returnObject) {
  // obj must be valid because collection-api will return early if it's undefined
  var record = obj;
  if (record.deleted) {
    returnObject.statusCode = 404;
    returnObject.body = {error: obj._id + " not found!"};
  } else {
    try {
      record.deleted = true;
      collection.update(record._id, record);
      returnObject.statusCode = 200;
      returnObject.body = {};
    } catch (e) {
      debug(e.toString());
      returnObject.statusCode = 500;
      returnObject.body = {error: e.toString()};
    }
  }
}

// function initLogCollections() {
//   try {
//     var packageList = .find().fetch();
//     for (var key in Logs) {
//       if (Logs.hasOwnProperty(key)) {
//         Logs[key].enable = false;
//       }
//     }
//     packageList.forEach(function(onePackage) {
//       var hash = onePackage.sha224_hash;
//       var packageName = onePackage.package;
//       onePackage.statements.forEach(function(statement) {
//         var key = hash + "_" + statement.label;
//         if (!Logs.hasOwnProperty(key)) {
//           Logs[key] = {
//             enable: true,
//             collection: new Meteor.Collection(key)
//           };
//         } else {
//           Logs[key].enable = true;
//         }
//       });
//     });
//   } catch (e) {
//     console.log(e.toString());
//   }
// }

function updateOneDevice(deviceIndex, packageList) {
  debug('update choices for ' + deviceIndex._id);
  var collection = initDeviceCollection(deviceIndex._id);

  var current = collection.findOne('0');
  var device = current.device;

  if (device.choices === undefined) {
    device.choices = {};
  }

  current.queryCount = current.queryCount + 1 || 1;

  var choices = device.choices;

  packageList.forEach(function(onePackage) {
    var packageName = onePackage.package.package;
    var compatibleName = dotEncode(packageName);

    if (!choices.hasOwnProperty(compatibleName)) {
      choices[compatibleName] = {
        name: packageName,
        labelJSON: {}
      };
    }

    var choiceForOnePackage = choices[compatibleName];
    if (choiceForOnePackage.labelJSON === undefined) {
      choiceForOnePackage.version = -1;
      choiceForOnePackage.labelJSON = {};
    }

    var labelJSON = choiceForOnePackage.labelJSON;

    if (choiceForOnePackage.version === onePackage._version) {
      debug('skip ' + packageName + ' because version is same: ' + onePackage._version);
    } else {
      choiceForOnePackage.version = onePackage._version;
      var statements = onePackage.package.statements;
      for (var label in statements) {
        if (statements.hasOwnProperty(label)) {
          var statement = statements[label];
          // if (!labelJSON.hasOwnProperty(statement.label)) {
          if (statement.choice === undefined) {
            statement.choice = 0;
          }
          if (statement.choiceCount === undefined) {
            statement.choiceCount = {};
          }
          var choiceCount = statement.choiceCount;
          statement.alternatives.forEach(function(oneAlternative) {
            var value = oneAlternative.value;
            if (!choiceCount.hasOwnProperty[value]) {
              choiceCount[oneAlternative.value] = 0;
            }
          });

          // TODO assign random one and update statement.choiceCount

          var random = Math.floor(Math.random() * (statement.alternatives.length));

          var choice = statement.alternatives[random].value;
          choiceCount[choice]++;
          labelJSON[statement.label] = {
            "label": statement.label,
            "choice": choice
          };
          // }
        } else {
          debug('Error: statements has ' + label + ' with no value!');
        }
      }

      // update count information in package
      var packageCollection = initPackageCollection(packageName);
      packageCollection.update('0', onePackage);
    }
  });
  collection.update(current._id, current);
  return device;
}

Meteor.startup(function() {
  // initLogCollections();

  maybeAPIv1 = new CollectionAPI({
    authToken: undefined,              // Require this string to be passed in on each request
    apiPath: 'maybe-api-v1',          // API path prefix
    standAlone: false,                 // Run as a stand-alone HTTP(S) server
    sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
    listenPort: 3005,                  // Port to listen to (stand-alone only)
    listenHost: undefined,             // Host to bind to (stand-alone only)
    privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
    certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
  });

  // curl http://localhost:3000/collectionapi/players/id/field/subfield?query1=1&query2=2 -d '{"a" : 1}'
  // requestMetadata = {
  //    collectionPath: 'players,
  //    collectionId: 'id',
  //    fields: [ 'field', 'subfield' ],
  //    query: {
  //      query1: '1',
  //      query2: '2'
  //    }
  //  }

  addDevices();
  addMetadata();
  addLogs();

  maybeAPIv1.start();
});

function addDevices() {
  maybeAPIv1.addCollection(Devices, 'devices', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        // rquire deviceid
        // optional gcmid
        returnObject.success = true;
        debug('POST device');

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

          var newRecord = addDeviceToCollection(obj, collection);

          var packageList = getPackageList();

          var deviceIndex = Devices.findOne(obj.deviceid);
          var device = updateOneDevice(deviceIndex, packageList);

          decodeDotForDevice(device);

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

        debug('GET devices');

        try {
          var packageList = getPackageList();

          var fields = requestMetadata.fields;

          var deviceList = [];
          objs.forEach(function(deviceIndex) {
            var device = updateOneDevice(deviceIndex, packageList);
            decodeDotForDevice(device);
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
      PUT: function(obj, newValues, requestMetadata) {
        // TODO: only allow for gcmid
        debug('PUT');
        debug(obj);
        debug(newValues);
        debug(requestMetadata);
        return true;
      },
      DELETE: function(obj, requestMetadata, returnObject) {
        returnObject.success = true;
        debug('DEL device, id: ' + obj._id);
        delFromIndexCollection(obj, Devices, returnObject);
        return true;
      }
    }
  });
}

function addMetadata() {
  maybeAPIv1.addCollection(MetaData, 'metadata', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        returnObject.success = true;
        debug('POST metadata');

        if (obj === undefined) {
          returnObject.statusCode = 400;
          returnObject.body = {error: 'your format is unsupported, only support json!'};
          return true;
        } else if (obj.package === undefined) {
          returnObject.statusCode = 400;
          returnObject.body = {error: JSON.stringify(obj) + ' have no package!'};
          return true;
        } else if (obj.sha224_hash === undefined) {
          returnObject.statusCode = 400;
          returnObject.body = {error: JSON.stringify(obj) + ' have no ssha224_hash!'};
          return true;
        }

        var packageName = obj.package;
        var hash = obj.sha224_hash;

        // handle this manually

        if (!insertToIndexCollection(packageName, MetaData, true, returnObject)) {
          return true;
        }

        try {
          var collection = initPackageCollection(packageName);

          var newRecord = addMetadataToCollection(obj, collection);

          returnObject.statusCode = 201;
          returnObject.body = requestMetadata.query && requestMetadata.query.callback === "0" && {} || newRecord;
          return true;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
          return true;
        }
      },
      GET: function(objs, requestMetadata, returnObject) {
        returnObject.success = true;

        debug('GET');
        var packages = [];
        try {
          objs.forEach(function(obj) {
            var collection = initPackageCollection(obj._id);
            var package = collection.findOne('0');
            packages.push(package.package);
          });
          returnObject.statusCode = 200;
          returnObject.body = packages;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
        }
        return true;
      },
      PUT: function(obj, newValues, requestMetadata) {
        debug('PUT to metadata is forbidden!');
        return false;
      },
      DELETE: function(obj, requestMetadata, returnObject) {
        debug('DEL metadata, id: ' + obj._id);

        returnObject.success = true;
        delFromIndexCollection(obj, MetaData, returnObject);
        return true;
      }
    },
    after: {
      POST: function() {
        debug("After POST");
      },
      GET: function() {
        debug("After GET");
      },
      PUT: function() {
        debug("After PUT");
      },
      DELETE: function() {
        debug("After DEL");
      }
    }
  });
}

function addLogs() {
  maybeAPIv1.addCollection(Logs, 'logs', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        debug('POST');
        debug(requestMetadata);
        debug(JSON.stringify(obj));
        if (requestMetadata.collectionId === undefined) {
          return false;
        }

        if (!obj.hasOwnProperty("sha224_hash")) {
          return false;
        }
        if (!obj.hasOwnProperty("label")) {
          return false;
        }

        var metaData = {
          deviceid: requestMetadata.collectionId,
          timestamp: new Date().valueOf()
        };

        var logEntry = {
          _metadata: metaData,
          value: obj
        };

        var hash = obj.sha224_hash;
        var label = obj.label;
        var key = hash + "_" + label;

        if (!Logs.hasOwnProperty(key) || !Logs[key].enable) {
          returnObject.success = true;
          returnObject.statusCode = 500;
          var error = "";
          if (MetaData.findOne(hash) === undefined) {
            error = "No package for " + hash;
          } else {
            error = "Package " + hash  + " has no label " + label;
          }
          returnObject.body = {
            error: error
          };
          return true;
        }

        try {
          Logs[key].collection.insert(logEntry);
          returnObject.success = true;
          returnObject.statusCode = 201;
          returnObject.body = logEntry;
        } catch (e) {
          returnObject.success = true;
          returnObject.statusCode = 500;
          returnObject.body = {
            error: e.toString()
          };
        }

        return true;
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
}
