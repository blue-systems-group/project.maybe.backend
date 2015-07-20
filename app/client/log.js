Template.logs.onCreated(function() {
  // debug(MetaData.find());
  // debug(Devices.find());
  // this.subscribe(name);
  // this.collection = getCollection(name);
  this.subscribe('metadata');
  this.subscribe('devices');
});

Template.logs.helpers({
  packages: function() {
    // TODO: /logs                         get all package names
    // template logs

    // TODO: /logs/:packageName            get package log indexCollection
    // template logPackage
    // TODO: some aggregation like: total log entry, device number, logs graph

    // TODO: /logs/:packageName/:deviceid  get log_package_deviceid collection
    // template logPackageDevice

    var packages = MetaData.find().fetch();
    return packages;
  }
});

IndexCollection = new Meteor.Collection('log_package_index_testing_inputs.maybe');
Template.log_package.onCreated(function () {
  // var name = ReactiveMethod.call('getPackageLogIndexCollection', this._id);
  var self = Template.currentData();
  // Meteor.call('getPackageLogIndexCollection', self._id, function(err, response) {
  //   console.log('err', err);
  //   console.log('res', response);
  //   Meteor.subscribe(response);
  // });
});

Template.log_package.helpers({
  packageName: function() {
    console.log(this);
    return this._id;
  },
  devices: function() {
    return [];
  },
  device: function() {
    console.log(this);
    return this._id;
  }
});

Template.showLog.helpers({
  packageName: function() {
    return this.packageName;
  },
  deviceid: function() {
    return this.deviceid;
  },
  test: function() {
    console.log(this);
    return "showLog";
  }
});
