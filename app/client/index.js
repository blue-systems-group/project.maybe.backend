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

  Router.route('/api', function () {
    this.render('api');
  });

  Router.route('/logs', function () {
    this.render('logs');
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
  MetaData = new Meteor.Collection('metadata');
  Devices = new Meteor.Collection('devices');
});

Template.home.onCreated(function () {
  this.subscribe('metadata', function() {
    // debug('metadata index subscribe complete');
  });
  this.subscribe('devices', function() {
    // debug('device index subscribe complete');
  });
});


function setGlobalVariables() {
  var duration = Meteor.settings && Meteor.settings.public && Meteor.settings.public.toggleDuration || 1024;
  Session.setDefault("toggleDuration", duration);
}
