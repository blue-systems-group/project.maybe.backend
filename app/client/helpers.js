var CollectionMap = {};

getCollection = function(name) {
  if(!CollectionMap.hasOwnProperty(name)) {
    CollectionMap[name] = new Meteor.Collection(name);
  }
  return CollectionMap[name];
};

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
    return batchSubscribe(MetaData, 'getPackage');
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
    return batchSubscribe(Devices, 'getDevice');
  }
});

Template.devicesList.events({
  'click .subtitle': function(event, template) {
    template.$('.deviceDetail').toggle(Session.get('toggleDuration'));
  }
});
