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
    return MetaData.find({actualCollection: {$exists: true}});
  }
});

Template.log_package.onCreated(function () {
  // var name = ReactiveMethod.call('getPackageLogIndexCollection', this._id);
  var self = Template.currentData();
  if (self.logIndexCollection !== undefined) {
    this.subscribe('getCollectionByName', self.logIndexCollection);
    this.subscribe('getCollectionByName', self.actualCollection);
  }
  // Meteor.call('getPackageLogIndexCollection', self._id, function(err, response) {
  //   console.log('err', err);
  //   console.log('res', response);
  //   Meteor.subscribe(response);
  // });
});

Template.log_package.rendered = function () {
  var template = this;
  // console.log(template.$('.packageName'));
  // console.log(template.$('.ct-chart'));
  var data = Template.currentData();
  this.autorun(function () {
    if (data.logIndexCollection) {
      // console.log('got');
      logIndexCollection = getCollection(data.logIndexCollection);
      var deviceArray = logIndexCollection.find().fetch();
      deviceArray = _.map(deviceArray, function (d) {
        return {
          deviceid: d._id,
          collection: getCollection(d.actualCollection)
        };
      }, data);
      var label = [];
      var num = [];
      _.each(deviceArray, function(d) {
        // console.log(d.deviceid, d.collection.find().count());
        label.push(d.deviceid);
        num.push(d.collection.find().count());
      });
      // console.log(deviceArray);
      // var chart = new Chartist.Line(event.target, {
      // console.log(template.find('.ct-chart'));
      var chart = new Chartist.Line(template.find('.ct-chart'), {
      // var chart = new Chartist.Line(this.find('.ct-chart'), {
        labels: label,
        series: [
          num
        ]
      }, {
        fullWidth: true,
      });
      // console.log('chart', chart);
    }
  });
};

Template.log_package.helpers({
  packageName: function() {
    return this._id;
  },
  labels: function() {
    var self = this;
    packageCollection = getCollection(self.actualCollection)
    var record = packageCollection.findOne('0');
    var statements = record && record.package && record.package.statements;
    if (statements) {
      var labels = Object.keys(statements);
      console.log(labels);
      return labels;
    }
    return [];
  },
  label: function() {
    return this;
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

Template.log_package.events({
  'click .packageName': function(event, target) {
    var self = this;
    console.log(this);
    if (self.logIndexCollection) {
      logIndexCollection = getCollection(self.logIndexCollection);
      var deviceArray = logIndexCollection.find().fetch();
      deviceArray = _.map(deviceArray, function (d) {
        return {
          deviceid: d._id,
          collection: getCollection(d.actualCollection)
        };
      }, self);
      var label = [];
      var num = [];
      _.each(deviceArray, function(d) {
        console.log(d.deviceid, d.collection.find().count());
        label.push(d.deviceid);
        num.push(d.collection.find().count());
      });
      console.log(deviceArray);
      // var chart = new Chartist.Line(event.target, {
      var chart = new Chartist.Line(Template.instance().$('.ct-chart')[0], {
        labels: label,
        series: [
          num
        ]
      }, {
        fullWidth: true,
        chartPadding: {
          right: 40
        }
      });
      console.log('chart', chart);
    }
    console.log($(event.target));
    console.log(target);
  }
});

Template.log_device.onCreated(function() {
  subscribeActualCollection(this);
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
    // codeNode.innerHTML = json2html.transform(jsonObject);
    codeNode.innerHTML = JSON.stringify(jsonObject);
    hljs.highlightBlock(codeNode);

    return root.innerHTML;
  }
});
