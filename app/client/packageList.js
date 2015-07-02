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
    template.$('.packageDetail').toggle(1000);
  }
});
