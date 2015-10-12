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
      return false;
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
    // TODO: error handle
    // TODO: record log for who changes what
    var collection = initPackageCollection(packageName);
    var document = collection.findOne('0');
    document.package.statements[label].choice = choice;
    collection.update('0', document);
    return;
  }
});
