Session.setDefault('showHideToggle', false);

var PackageCollections = {};

Template.packageList.helpers({
  packages: function() {
    // return MetaData.find();
    var packageIndex = MetaData.find().fetch();

    var packageArray = [];

    packageIndex.forEach(function(onePackage) {
      var name = ReactiveMethod.call('getPackage', onePackage._id);
      if (name !== undefined) {
        if (!PackageCollections.hasOwnProperty(name)) {
          // console.log('subscribe: ' + name);
          Meteor.subscribe(name, function() {
            // console.log('content: ' + PackageCollections[name].find().fetch());
          });
          PackageCollections[name] = new Meteor.Collection(name);
        }
        packageArray.push(PackageCollections[name]);
      }
    });
    return packageArray;
  }
});

Template.packageList.events({
  'click .subtitle': function(event, template) {
    var isShow = Session.get('showHideToggle');
    if (isShow) {
      template.$('.packageDetail').show(1000);
    } else {
      template.$('.packageDetail').hide(1000);
    }
    Session.set('showHideToggle', !isShow);
  }
});
