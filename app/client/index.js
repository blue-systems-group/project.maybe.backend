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
});

Template.home.onCreated(function () {
  this.subscribe('metadata', function() {
    // debug('metadata index subscribe complete');
    MetaData = new Meteor.Collection('metadata');
  });
  this.subscribe('devices', function() {
    // debug('device index subscribe complete');
    Devices = new Meteor.Collection('devices');
  });
});


function setGlobalVariables() {
  var duration = Meteor.settings && Meteor.settings.public && Meteor.settings.public.toggleDuration || 1024;
  Session.setDefault("toggleDuration", duration);
}

Template.api.events({
  'click #api-title': function() {
    Router.go('/README.html');
  }
});
