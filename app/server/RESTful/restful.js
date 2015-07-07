// prepare collections
Devices = new Meteor.Collection('devices');
MetaData = new Meteor.Collection('metadata');
var maybeAPIv1;

// publish collections
Meteor.publish('metadata', function() {
  return MetaData.find({deleted: false}, {fields: {deleted: 0}});
});

Meteor.publish('devices', function() {
  return Devices.find({deleted: false}, {fields: {deleted: 0}});
});

var Logs = new Meteor.Collection('logs');
// var Logs = {};

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

updateOneDevice = function(deviceIndex, packageList) {
  debug('update choices for ' + deviceIndex._id);
  var collection = initDeviceCollection(deviceIndex._id);

  var current = collection.findOne('0');
  var device = current.device;

  if (device.choices === undefined) {
    device.choices = {};
  } else {
    device.choices = arrayToMap(device.choices, 'packageName');
  }

  current.queryCount = current.queryCount + 1 || 1;

  var choices = device.choices;

  packageList.forEach(function(onePackage) {
    var packageName = onePackage.package.package;

    if (!choices.hasOwnProperty(packageName)) {
      choices[packageName] = {
        packageName: packageName,
        labelJSON: {}
      };
    }

    var choiceForOnePackage = choices[packageName];
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

          initChoiceCount(statement.alternatives, choiceCount);
          // statement.alternatives.forEach(function(oneAlternative) {
          //   var value = oneAlternative.value;
          //   if (!choiceCount.hasOwnProperty[value]) {
          //     choiceCount[oneAlternative.value] = 0;
          //   }
          // });

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

  var choiceMap = device.choices;
  device.choices = mapToArray(choiceMap);
  collection.update(current._id, current);
  device.choices = choiceMap;
  return device;
};

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

  addDevices(maybeAPIv1);
  addMetadata(maybeAPIv1);
  addLogs();

  maybeAPIv1.start();
});

function addLogs() {
  maybeAPIv1.addCollection(Logs, 'logs', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        debug('POST log: ' + JSON.stringify(obj) + ' with: ' + JSON.stringify(requestMetadata));
        return true;

        // if (requestMetadata.collectionId === undefined) {
        //   return false;
        // }

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
}

// avoid duplicated publish
