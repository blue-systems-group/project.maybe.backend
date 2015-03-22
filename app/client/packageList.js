Template.packageList.helpers({
  packages: function() {
    return MetaData.find();
  }
});

Template.packageList.events({
  'click .subtitle': function(event, template) {
    template.$('.packageDetail').toggle(1000);
  }
});
