Meteor.startup(function() {
  // console.log("StartUp");

  // hljs.configure({
  //     useBR: true,
  // });

  setGlobalVariables();

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

  $(window).scroll(function(event){
    Session.set('didScroll', true);
  });
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

  Session.setDefault('didScroll', false);
}
