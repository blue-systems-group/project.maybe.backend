filterDeleted = function(objs, returnObject) {
  var records = [];
  objs.forEach(function(obj) {
    if (obj.hasOwnProperty('deleted')) {
      if (obj.deleted === false) {
        records.push(obj);
      }
    } else {
      debug(obj + ' has no deleted field!');
    }
  });
  if (records.length === 0) {
    returnObject.statusCode = 404;
    returnObject.body = {message: 'No Record(s) Found'};
  }
  return records;
};

initCollection = function(map, key, prefix) {
  prefix = prefix || 'noprefix';
  key = prefix + '_' + key;
  try {
    if (!map.hasOwnProperty(key)) {
      debug('create Collection: ' + key);
      map[key] = {
        enable: true,
        collection: new Meteor.Collection(key)
      };
      map._length = map._length && map._length + 1 || 1;
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
};

staleData = function(collection) {
  var current = collection.findOne('0');
  if (current !== undefined) {
    collection.remove(current);

    current._id = current._version.toString();
    current._dumpAt = new Date().valueOf();

    collection.insert(current);
  }
  return current;
};

addDeviceToCollection = function(obj, collection) {
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
};

addMetadataToCollection = function(obj, collection) {
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
};

insertToIndexCollection = function(id, collection, allowDuplicated, returnObject) {
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
};

delFromIndexCollection = function(obj, collection, returnObject) {
  // obj must be valid because collection-api will return early if it's undefined
  var record = obj;
  if (record.deleted === true) {
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
};

initChoiceCount = function(alternatives, choiceCount) {
  alternatives.forEach(function(oneAlternative) {
    var value = oneAlternative.value;
    if (!choiceCount.hasOwnProperty[value]) {
      choiceCount[oneAlternative.value] = 0;
    }
  });
};

var publishedCollection = {};

publishCollection = function(collection) {
  if (!publishedCollection.hasOwnProperty(collection._name)) {
    Meteor.publish(collection._name, function() {
      // only return current ('0') record
      return collection.find('0');
    });
    console.log('publish: ' + collection._name + ', count: ' + collection.find('0').count());
    publishedCollection[collection._name] = collection;
  }
  return collection._name;
};
