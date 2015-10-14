// prepare collections
Devices = new Meteor.Collection('devices');
MetaData = new Meteor.Collection('metadata');
Logs = new Meteor.Collection('logs');
var maybeAPIv1;

// publish collections
Meteor.publish('metadata', function() {
  var user = this.userId;
  console.log('user', user);
  return MetaData.find({deleted: false}, {fields: {deleted: 0}});
});

Meteor.publish('devices', function() {
  return Devices.find({deleted: false}, {fields: {deleted: 0}});
});

Meteor.publish('getCollectionByName', function(collectionName) {
  return getCollection(collectionName).find();
});

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

  if (device.choices) {
    device.choices = arrayToMap(device.choices, 'packageName');
  } else {
    device.choices = {};
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


          // DONE: handle fixed and random
          // DONE: assign random one and update statement.choiceCount
          // if (fixed) { assign fixed } else { assign random value }
          if (statement.assignPolicy === 'fixed') {
            var choice = statement.choice || 0;
          } else {
            var random = Math.floor(Math.random() * (statement.alternatives.length));
            var choice = statement.alternatives[random].value;
          }
          choiceCount[choice]++;
          labelJSON[statement.label] = {
            'label': statement.label,
            'choice': choice,
            'range': statement.alternatives.length
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
  addLogs(maybeAPIv1);

  maybeAPIv1.start();
});
