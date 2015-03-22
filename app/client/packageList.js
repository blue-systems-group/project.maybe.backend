Template.packageList.helpers({
  packages: function() {
    return MetaData.find();
  },
  select: function() {
    var hash = Session.get("selectHash");
    var label = Session.get("selectLabel");
    return hash + ":" + label;
  },
  choiceDetails: function() {
    var package = Session.get("selectPackage");
    if (package === "default") {
      return "default";
    }
    var hash = Session.get("selectHash");
    var label = Session.get("selectLabel");

    var packageDocument = MetaData.findOne(package);
    if (packageDocument === undefined || packageDocument.statements === undefined) {
      return "no package metaData for " + package;
    }
    var statement;
    packageDocument.statements.some(function(oneStatement) {statement = oneStatement; return oneStatement.label === label;});
    var devices = Devices.find().fetch();

    var alternatives = statement.alternatives;
    var valueJSONObject = {};
    alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = []});

    devices.forEach(function(oneDevice) {
      if (oneDevice.choices[hash] && oneDevice.choices[hash].labels) {
        var labels = oneDevice.choices[hash].labels;
        labels.forEach(function(oneLabel) {
          if (oneLabel.label === label) {
            console.log(oneDevice._id + " choose " + oneLabel.choice);
            valueJSONObject[oneLabel.choice].push(oneDevice._id);
          }
        });
      }
    });
    // console.log(JSON.stringify(valueJSONObject));

    // var target = event.target;
    // console.log(event);
    // console.log(event.toElement);
    var root = document.createElement("div");
    var preNode = document.createElement("pre");
    preNode.className = "json";

    root.appendChild(preNode);

    var codeNode = document.createElement("code");
    codeNode.className = "json";

    preNode.appendChild(codeNode);

    codeNode.innerHTML = json2html.transform(valueJSONObject);
    hljs.highlightBlock(codeNode);

    return root.innerHTML;
  }
});

Template.packageList.events({
  'click .subtitle': function(event, template) {
    template.$('.packageDetail').toggle(1000);
  }
});
