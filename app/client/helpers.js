var CollectionMap = {};

getCollection = function(name) {
  if(!CollectionMap.hasOwnProperty(name)) {
    CollectionMap[name] = new Meteor.Collection(name);
  }
  Package['meteortoys:toykit'].MeteorToysDict.set('Mongol', {
    collections: Object.keys(CollectionMap)
  });
  return CollectionMap[name];
};

subscribeActualCollection = function(self) {
  self.collection = getCollection(Template.currentData().actualCollection);
  self.subscribe('getCollectionByName', Template.currentData().actualCollection);
}

// call server side method to publish collection
// by deviceid/package name, and return array contains collection name
function batchSubscribe(indexCollection, functionName) {
  var index = indexCollection.find().fetch();
  var array = [];
  index.forEach(function(one) {
    var name = ReactiveMethod.call(functionName, one._id);
    if (name !== undefined) {
      array.push(name);
    }
  });
  return array;
}

Session.setDefault('packageShowing', false);

Template.packageList.helpers({
  packages: function() {
    return MetaData.find({actualCollection: {$exists: true}});
  }
});

Template.packageList.events({
  'click .subtitle': function(event, template) {
    var showing = Session.get('packageShowing');
    if (showing) {
      template.$('.packageDetail').hide(Session.get('toggleDuration'));
    } else {
      template.$('.packageDetail').show(Session.get('toggleDuration'));
    }
    Session.set('packageShowing', !showing);
  }
});

Template.devicesList.helpers({
  devices: function() {
    return Devices.find({actualCollection: {$exists: true}});
  }
});

Template.devicesList.events({
  'click .subtitle': function(event, template) {
    template.$('.deviceDetail').toggle(Session.get('toggleDuration'));
  }
});
