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
  this.subscribe('metadata');
  this.subscribe('devices');
});

Template.packages.onCreated(function () {
  this.subscribe('metadata');
});

Template.devices.onCreated(function () {
  this.subscribe('devices');
});


function setGlobalVariables() {
  var duration = Meteor.settings && Meteor.settings.public && Meteor.settings.public.toggleDuration || 1024;
  Session.setDefault("toggleDuration", duration);

  Session.setDefault('didScroll', false);
}
