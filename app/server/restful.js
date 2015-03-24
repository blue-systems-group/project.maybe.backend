var Logs = {};

function getMinChoice(statement, choiceCount) {
  var minChoice = statement.choice;
  var minCount = Number.MAX_VALUE;
  Object.keys(choiceCount).map(function(key) {
    if (choiceCount[key] < minCount) {
      minChoice = key;
    }
  });
  choiceCount[minChoice] = choiceCount[minChoice] + 1;
  console.log("choice is " + minChoice);
  console.log("count " + choiceCount[minChoice]);
  console.log(choiceCount);
  return minChoice;
};

function initLogCollections() {
  try {
    var packageList = MetaData.find().fetch();
    for (var key in Logs) {
      if (Logs.hasOwnProperty(key)) {
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
  } catch (e) {
    console.log(e.toString());
  }
}

function updateOneDevice(device, packageList) {
  device.queryCount = device.queryCount + 1 || 1;

  if (device.choices === undefined) {
    device.choices = {};
  }
  var choices = device.choices;
  packageList.forEach(function(onePackage) {
    var hash = onePackage.sha224_hash;
    if (!choices.hasOwnProperty(hash)) {
      choices[hash] = {
        name: onePackage.package,
        labelJSON: {}
      };
    }

    var choiceForOnePackage = choices[hash];
    if (choiceForOnePackage.labelJSON === undefined) {
      choiceForOnePackage.labelJSON = {};
    }

    var labelJSON = choiceForOnePackage.labelJSON;

    var jinghao = 0;
    var poor = "PoorLinkLossThreshold";
    var good = "GoodLinkLossThreshold";

    var tempLabel1 = "hit_factor";
    var tempLabel2 = "screen_timeout";
    onePackage.statements.forEach(function(statement) {
      if (statement.label === poor || statement.label === good) {
        jinghao++;
      }
      if (!labelJSON.hasOwnProperty(statement.label)) {
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
        if (statement.label === tempLabel1 || statement.label === tempLabel2) {
          choice = 1;
        }
        choiceCount[choice]++;
        labelJSON[statement.label] = {
          "label": statement.label,
          "choice": choice
        };
      }
    });

    if (jinghao === 2) {
      // if (labelJSON[poor].choice < labelJSON[good].choice) {
      //   console.log("change poor " + labelJSON[poor].choice + " to " + labelJSON[good].choice);
      //   labelJSON[poor].choice = labelJSON[good].choice;
      // }
      console.log("change poor " + labelJSON[poor].choice + " to " + labelJSON[good].choice);
      labelJSON[poor].choice = labelJSON[good].choice;
    }
    choiceForOnePackage.labels = Object.keys(labelJSON).map(function(k) { return labelJSON[k] });
    try {
      MetaData.update(onePackage._id, onePackage);
    } catch (e) {
      console.log(e.toString());
    }
  });

  console.log(device);
  Devices.update(device._id, device);
}

Meteor.startup(function() {
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
      POST: function(obj, requestMetadata) {
        console.log('POST');
        obj._id = obj.deviceid;
        return true;
      },
      GET: function(objs, requestMetadata, returnObject) {
        console.log('GET');
        var packageList = MetaData.find().fetch();

        // if (requestMetadata.collectionId) {
        if (requestMetadata.collectionId && requestMetadata.fields && requestMetadata.fields.length > 0 && objs.length === 1) {
          returnObject.success = true;
          var fields = requestMetadata.fields;
          var device = objs[0];

          updateOneDevice(device, packageList);

          var choices = device.choices;
          var sha224_hash = fields[0];
          if (!choices.hasOwnProperty(sha224_hash)) {
            returnObject.statusCode = 500;
            returnObject.body = {
              error: "device " + requestMetadata.collectionId + " doesn't have package hash: " + sha224_hash
            };
            return true;
          }
          if (fields.length == 1) {
            returnObject.statusCode = 200;
            returnObject.body = choices[sha224_hash];
            return true;
          }

          var label = fields.slice(1).join(" ");
          var choice = choices[sha224_hash];
          var labels = choice.labels;
          if (!label || !choice || !labels || labels.length === 0) {
            returnObject.statusCode = 500;
            returnObject.body = {
              error: "device " + requestMetadata.collectionId + " with " + sha224_hash + " have something wrong!"
            };
            return true;
          }

          labels.forEach(function(oneLabel) {
            if (oneLabel.label === label) {
              returnObject.statusCode = 200;
              returnObject.body = oneLabel;
            }
          });

          if (!returnObject.statusCode) {
            returnObject.statusCode = 500;
            returnObject.body = {
              error: "device " + requestMetadata.collectionId + " with " + sha224_hash + " doesn't have label: " + label
            };
          }

          return true;
        }

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
}

function addMetadata() {
  maybeAPIv1.addCollection(MetaData, 'metadata', {
    authToken: undefined,
    methods: ['POST','GET','PUT','DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        console.log('POST');
        var packageName = obj.package;
        var hash = obj.sha224_hash;

        // handle this manually
        returnObject.success = true;

        if (packageName === undefined || hash === undefined) {
          returnObject.statusCode = 500;
          returnObject.body = {error: "no package or sha224_hash provided!"};
          return true;
        }

        obj._id = packageName;
        try {
          var record = MetaData.findOne(packageName);
          if (record === undefined) {
            MetaData.insert(obj);
            record = obj;
          } else {
            var statements = {};
            record.statements.forEach(function(oneStatement) {
              statements[oneStatement.label] = oneStatement;
            });
            console.log(statements);
            var incomeStatements = {};
            obj.statements.forEach(function(oneStatement) {
              statements[oneStatement.label] = oneStatement;
            });
            // var newStatements = [];
            var newStatements = Object.keys(statements).map(function(key) { return statements[key]; });
            record.statements = newStatements;

            MetaData.update(record._id, record);
          }
          returnObject.statusCode = 201;
          returnObject.body = requestMetadata.query && requestMetadata.query.callback === "0" && {} || record;
          return true;
        } catch (e) {
          returnObject.statusCode = 500;
          returnObject.body = {error: e.toString()};
          return true;
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
      DELETE: function(obj, requestMetadata, returnObject) {
        console.log('DEL');
        if (!obj && requestMetadata.collectionId != undefined) {
          returnObject.success = true;
          try {
            var delCount = 0;
            MetaData.find({package: requestMetadata.collectionId}).forEach(function(record) {
              console.log("del " + record._id);
              MetaData.remove(record);
              delCount++;
            });
            if (delCount === 0) {
              returnObject.statusCode = 500;
              returnObject.body = {error: "No packageName: " + requestMetadata.collectionId};
            } else {
              returnObject.statusCode = 200;
              returnObject.body = "";
            }
          } catch (e) {
            console.log(e.toString());
            returnObject.statusCode = 500;
            returnObject.body = {error: e.toString()};
            return true;
          }
          return true;
        }
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

}

function addLogs() {
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
}
