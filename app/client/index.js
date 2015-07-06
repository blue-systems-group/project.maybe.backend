Meteor.startup(function() {
  // console.log("StartUp");

  // hljs.configure({
  //     useBR: true,
  // });

  setGlobalVariables();

  Router.configure({
    notFoundTemplate: "Home"
  });

  Router.route('/', function () {
    this.render('Home');
  });

  hljs.initHighlightingOnLoad();
  Session.setDefault("selectPackage", "default");
  Session.setDefault("selectHash", "default");
  Session.setDefault("selectLabel", "default");
  // $(document).ready(function() {
  //     $('pre code').each(function(i, block) {
  //         hljs.highlightBlock(block);
  //     });
  // });
  Meteor.subscribe('metadata', function() {
    // debug('metadata index subscribe complete');
  });
  Meteor.subscribe('devices', function() {
    // debug('device index subscribe complete');
  });
});

MetaData = new Meteor.Collection('metadata');
Devices = new Meteor.Collection('devices');

function setGlobalVariables() {
  var duration = Meteor.settings && Meteor.settings.public && Meteor.settings.public.toggleDuration || 1024;
  Session.setDefault("toggleDuration", duration);
}

Template.api.events({
  'click #api-title': function() {
    Router.go('/README.html');
  }
});

var DeviceCollections = {};

Template.devicesList.helpers({
  devices: function() {
    // return Devices.find();
    var deviceIndex = Devices.find().fetch();

    var deviceArray = [];

    deviceIndex.forEach(function(onePackage) {
      var name = ReactiveMethod.call('getDevice', onePackage._id);
      if (name !== undefined) {
        if (!DeviceCollections.hasOwnProperty(name)) {
          // console.log('subscribe: ' + name);
          Meteor.subscribe(name, function() {
            console.log('content: ' + DeviceCollections[name].find().fetch());
          });
          DeviceCollections[name] = new Meteor.Collection(name);
        }
        deviceArray.push(DeviceCollections[name]);
      }
    });
    return deviceArray;
  }
});

Template.devicesList.events({
  'click .subtitle': function(event, template) {
    template.$('.deviceDetail').toggle(Session.get('toggleDuration'));
  }
});
