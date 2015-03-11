Logs = {};

function initLogCollections() {
  try {
    var packageList = MetaData.find().fetch();
    for (var key in Logs) {
      if (Logs.hasOwnProperty(key)) {
        console.log("disable: " + key);
        Logs[key].enable = false;
      }
    }
    packageList.forEach(function(onePackage) {
      var hash = onePackage.sha224_hash;
      var packageName = onePackage.package;
      onePackage.statements.forEach(function(statement) {
        var key = hash + "_" + statement.label;
        if (!Logs.hasOwnProperty(key)) {
          Logs[key] = {
            enable: true,
            collection: new Meteor.Collection(key)
          };
        } else {
          Logs[key].enable = true;
        }
      });
    });
    console.log("Logs length:" + Object.keys(Logs).length);
  } catch (e) {
    console.log(e.toString());
  }
}

function updateOneDevice(device, packageList) {
  device.queryCount = device.queryCount + 1 || 1;

  var choices = {};
  packageList.forEach(function(onePackage) {
    var hash = onePackage.sha224_hash;
    var array = [];
    onePackage.statements.forEach(function(statement) {
      if (statement.choice === undefined) {
        statement.choice = 0;
      }
      var label = {
        "label": statement.label,
        "choice": statement.choice
      };
      array.push(label);
    });
    choices[hash] = {
      name: onePackage.package,
      labels: array
    };
  });

  device.choices = choices;

  console.log(device);
  Devices.update(device._id, device);
}

Meteor.startup(function () {
  initLogCollections();

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
  maybeAPIv1.addCollection(Devices, 'devices', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata) {
        console.log('POST');
        obj._id = obj.deviceid;
        return true;
      },
      GET: function(objs, requestMetadata) {
        console.log('GET');
        var packageList = MetaData.find().fetch();

        objs.forEach(function(device) {
          updateOneDevice(device, packageList);
          if (device.hasOwnProperty('_id')) {
            delete device['_id'];
          }
        });

        return true;
      },
      PUT: function(obj, newValues, requestMetadata) {
        console.log('PUT');
        console.log(obj);
        console.log(newValues);
        console.log(requestMetadata);
        return true;
      },
      DELETE: function(obj, requestMetadata) {
        console.log('DEL');
        if (obj === undefined) {
          return false;
        }
        return true;
      }
    }
  });

  maybeAPIv1.addCollection(MetaData, 'metadata', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj) {
        console.log('POST');
        // set id for that
        // TODO: enforce schema for POST new metadata https://github.com/aldeed/meteor-collection2
        var id = "sha224_hash";
        if (obj.hasOwnProperty(id)) {
          obj._id = obj[id];
          console.log("valid");
          return true;
        } else {
          console.log("invalid");
          return false;
        }
      },
      GET: function(objs) {
        console.log('GET');
        console.log(objs);
        initLogCollections();
        return true;
      },
      PUT: function(obj, newValues, requestMetadata) {
        console.log('PUT');
        console.log(obj);
        console.log(newValues);
        console.log(requestMetadata);
        return true;
      },
      DELETE: function(obj, requestMetadata) {
        console.log('DEL');
        if (obj === undefined) {
          return false;
        }
        return true;
      }
    },
    after: {
      POST: function() {
        console.log("After POST");
        initLogCollections();
      },
      GET: function() {
        console.log("After GET");
      },
      PUT: function() {
        console.log("After PUT");
        initLogCollections();
      },
      DELETE: function() {
        console.log("After DEL");
        initLogCollections();
      }
    }
  });

  maybeAPIv1.addCollection(Logs, 'logs', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        console.log('POST');
        console.log(requestMetadata);
        console.log(JSON.stringify(obj));
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
        console.log('GET');
        console.log(objs);
        return true;
      },
      PUT: function(obj, newValues, requestMetadata) {
        console.log('PUT');
        console.log(obj);
        console.log(newValues);
        console.log(requestMetadata);
        return true;
      },
      DELETE: function(obj, requestMetadata) {
        console.log('DEL');
        if (obj === undefined) {
          return false;
        }
        return false;
      }
    }
  });

  maybeAPIv1.start();
});
