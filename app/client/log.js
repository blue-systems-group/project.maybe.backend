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

    // var packages = MetaData.find().fetch();
    // return packages;
    return MetaData.find();
  }
});

Template.log_package.onCreated(function () {
  // var name = ReactiveMethod.call('getPackageLogIndexCollection', this._id);
  var self = Template.currentData();
  if (self.logIndexCollection !== undefined) {
    this.subscribe('getCollectionByName', self.logIndexCollection);
  }
  // Meteor.call('getPackageLogIndexCollection', self._id, function(err, response) {
  //   console.log('err', err);
  //   console.log('res', response);
  //   Meteor.subscribe(response);
  // });
});

Template.log_package.helpers({
  packageName: function() {
    return this._id;
  },
  devices: function() {
    var self = this;
    if (self.logIndexCollection === undefined) {
      return [];
    }
    var indexCollection = getCollection(self.logIndexCollection);
    return indexCollection.find();
  },
  device: function() {
    return this._id;
  }
});

Template.log_device.onCreated(function() {
  this.collection = getCollection(Template.currentData().actualCollection);
  this.subscribe('getCollectionByName', Template.currentData().actualCollection);
});

Template.log_device.helpers({
  temp: function() {
    return 'temp';
  },
  packageName: function() {
    return this.packageName;
  },
  deviceid: function() {
    return this._id;
  },
  logs: function() {
    var collection = Template.instance().collection;
    return collection.find();
  },
  count: function() {
    var collection = Template.instance().collection;
    return collection.find().count();
  },
  logHtmlCode: function() {
    var root = document.createElement("div");
    var preNode = document.createElement("pre");
    preNode.className = "json";

    root.appendChild(preNode);

    var codeNode = document.createElement("code");
    codeNode.className = "json";

    preNode.appendChild(codeNode);

    var jsonObject = this;
    codeNode.innerHTML = json2html.transform(jsonObject);
    hljs.highlightBlock(codeNode);

    return root.innerHTML;
  }
});
