function batchSubscribe(indexCollection, map, functionName) {
  var index = indexCollection.find().fetch();
  var array = [];
  index.forEach(function(one) {
    var name = ReactiveMethod.call(functionName, one._id);
    if (name !== undefined) {
      if (!map.hasOwnProperty(name)) {
        Meteor.subscribe(name);
      }
      map[name] = new Meteor.Collection(name);
      array.push(map[name]);
    }
  });
  return array;
}

Session.setDefault('packageShowing', false);

var PackageCollections = {};

Template.packageList.helpers({
  packages: function() {
    return batchSubscribe(MetaData, PackageCollections, 'getPackage');
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

var DeviceCollections = {};

Template.devicesList.helpers({
  devices: function() {
    return batchSubscribe(Devices, DeviceCollections, 'getDevice');
  }
});

Template.devicesList.events({
  'click .subtitle': function(event, template) {
    template.$('.deviceDetail').toggle(Session.get('toggleDuration'));
  }
});
