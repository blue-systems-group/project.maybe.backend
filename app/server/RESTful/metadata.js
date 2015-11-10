var PackageCollections = {};

initPackageCollection = function(key) {
  return initCollection(PackageCollections, key, 'package');
};

getPackageList = function() {
  var packageList = [];
  var packageIndexList = MetaData.find({deleted: false}).fetch();
  packageIndexList.forEach(function(packageIndex) {
    var collection = initPackageCollection(packageIndex._id);
    var record = collection.findOne('0');
    packageList.push(record);
  });
  return packageList;
};

addMetadata = function(maybeAPIv1) {
  maybeAPIv1.addCollection(MetaData, 'metadata', {
    authToken: undefined,
    authenticate: function(token, method, requestMetadata) {
      console.log("authen");
      console.log("token: " + token);
      console.log("method: " + method);
      console.log("requestMetadata: " + JSON.stringify(requestMetadata));
      var apiKey = APIKeys.findOne({"key": token});
      if (apiKey) {
        console.log(apiKey.owner);
        return true;
      }
      // if (!token) {
      //   return false;
      // }
      return true;
    },
    methods: ['POST', 'GET', 'DELETE'],
    before: {
      POST: function(obj, requestMetadata, returnObject) {
        returnObject.success = true;
        debug('POST metadata: ' + JSON.stringify(obj));

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
        // var hash = obj.sha224_hash;

        // handle this manually

        if (!insertToIndexCollection(packageName, MetaData, true, returnObject)) {
          return true;
        }

        try {
          var collection = initPackageCollection(packageName);
          updateToIndexCollection(packageName, MetaData, 'actualCollection', collection._name);

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

        debug('GET metadata(s): ' + JSON.stringify(requestMetadata));

        objs = filterDeleted(objs, returnObject);
        if (objs.length === 0) {
          return true;
        }

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
      DELETE: function(obj, requestMetadata, returnObject) {
        debug('DEL metadata: ' + obj._id);

        returnObject.success = true;
        delFromIndexCollection(obj, MetaData, returnObject);
        return true;
      }
    }
  });
};

Meteor.methods({
  setFixedChoice: function(packageName, label, choice) {
    return updateMetadata(packageName, label, choice, 'fixed')
  },
  setRandomChoice: function(packageName, label) {
    return updateMetadata(packageName, label, -1, 'random')
  }
});

function updateMetadata(packageName, label, choice, policy) {
    var collection = initPackageCollection(packageName);
    var document = collection.findOne('0');
    document.package.statements[label].choice = choice;
    document.package.statements[label].assignPolicy = policy;
    try {
      collection.update('0', document);
    } catch(exception) {
      return exception;
    }
    return updateAllDevice(packageName, label);
}

function updateAllDevice(packageName, label) {
  var index = MetaData.findOne({'_id': packageName, "deleted": false});
  if (index === undefined || index === null) {
    console.log(packageName, 'not found!');
    return;
  }
  var collection = initPackageCollection(index._id);
  var record = collection.findOne('0');

  var statement = record.package.statements[label];
  if (statement.assignPolicy === 'fixed') {
    var fixedChoice = statement.choice;
  } else {
    var range = statement.alternatives.length;
  }

  var deviceList = [];
  var deviceIndexList = Devices.find({deleted: false}).fetch();
  deviceIndexList.forEach(function(deviceIndex) {
    var collection = initDeviceCollection(deviceIndex._id);
    var record = collection.findOne('0');
    choices = record.device.choices;
    for (var i in choices) {
      var choice = choices[i];
      if (choice.packageName === packageName) {
        if (fixedChoice !== undefined) {
          choice.labelJSON[label].choice = fixedChoice;
        } else {
          choice.labelJSON[label].choice = Math.floor(Math.random() * range);
        }
        try {
          collection.update('0', record);
        } catch(exception) {
          return exception;
        }
      }
    }
  });

  if (fixedChoice !== undefined) {
    console.log('set all choice of package: ' + packageName + ' label: ' + label + ' to: ' + fixedChoice);
    return fixedChoice;
  }
  console.log('set all choice of package: ' + packageName + ' label: ' + label + ' to random value less than: ' + range);
  return range;
}
