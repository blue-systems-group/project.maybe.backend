Meteor.startup(function() {
  console.log("StartUp");
  // hljs.configure({
  //     useBR: true,
  // });
  hljs.initHighlightingOnLoad();

  // $(document).ready(function() {
  //     $('pre code').each(function(i, block) {
  //         hljs.highlightBlock(block);
  //     });
  // });
});

Template.api.events({
  'click #api-title': function() {
    var api = $('#api-content');
    api.toggle(1000);
  }
});

Template.devicesList.helpers({
  devices: function() {
    return Devices.find();
  }
});

Template.packageList.helpers({
  packages: function() {
    var result = MetaData.find();
    console.log(result);
    return MetaData.find();
  }
});
