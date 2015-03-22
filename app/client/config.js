var statement;
var alternatives;
var valueJSONObject = {};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

function split(array, chunkSize) {
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
};

function updateOneDevice(deviceid, device, package, hash, label, value, choiceCount) {
  var oneDevice = device;
  if (oneDevice === null) {
    oneDevice = Devices.findOne(deviceid);
  }
  if (oneDevice === undefined) {
    return false;
  }
  var currentChoice = oneDevice.choices[hash].labelJSON[label].choice;
  if (currentChoice  !== value) {
    // console.log("update for " + deviceid + ", " + value + " previous is " + currentChoice);

    oneDevice.choices[hash].labelJSON[label].choice = value;
    oneDevice.choices[hash].labels = Object.keys(oneDevice.choices[hash].labelJSON).map(function(k) { return oneDevice.choices[hash].labelJSON[k] });
    try {
      Devices.update(deviceid, oneDevice);
      choiceCount[value] = choiceCount[value] + 1 || 1;
      return true;
    } catch (e) {
      console.log(e.toString());
    }
  } else {
    choiceCount[currentChoice] = choiceCount[currentChoice] + 1 || 1;
  }
  return false;
}

function assignValue(valueJSONObject, value) {
  var package = Session.get("selectPackage");
  if (package === "default") {
    return "default";
  }
  var hash = Session.get("selectHash");
  var label = Session.get("selectLabel");

  var poor = "PoorLinkLossThreshold";
  var good = "GoodLinkLossThreshold";
  if (label === poor || label === good) {
    console.log("label: " + label + " is not allowed to change distribution.");
    return null;
  }

  if (valueJSONObject === null) {
    console.log("assign one value: " + value + " for package: " + package + ", label: " + label);
  } else {
    console.log("assign random values for package: " + package + ", label: " + label);
  }

  var packageDocument = MetaData.findOne(package);
  if (packageDocument === undefined || packageDocument.statements === undefined) {
    return null;
  }

  packageDocument.statements.some(function(oneStatement) {statement = oneStatement; return oneStatement.label === label;});

  alternatives = statement.alternatives;
  statement.choiceCount = {};
  var choiceCount = statement.choiceCount;

  if (valueJSONObject === null) {
    var devices = Devices.find().fetch();
    devices.forEach(function(oneDevice) {
      updateOneDevice(oneDevice._id, oneDevice, package, hash, label, value, choiceCount);
    });
  } else {
    Object.keys(valueJSONObject).map(function(key) {
      if (valueJSONObject.hasOwnProperty(key) && valueJSONObject[key]) {
        valueJSONObject[key].forEach(function (deviceid) {
          updateOneDevice(deviceid, null, package, hash, label, key, choiceCount);
        });
      }
    });
  }
  MetaData.update(packageDocument._id, packageDocument);
  return null;
};

Template.config.helpers({
  select: function() {
    var package = Session.get("selectPackage");
    var label = Session.get("selectLabel");
    return package + ":" + label;
  },
  valueJSONObject: function() {
    var package = Session.get("selectPackage");
    if (package === "default") {
      return "default";
    }
    var hash = Session.get("selectHash");
    var label = Session.get("selectLabel");

    var packageDocument = MetaData.findOne(package);
    if (packageDocument === undefined || packageDocument.statements === undefined) {
      return undefined;
    }

    packageDocument.statements.some(function(oneStatement) {statement = oneStatement; return oneStatement.label === label;});
    var devices = Devices.find().fetch();
    alternatives = statement.alternatives;
    valueJSONObject = {};

    alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = []});
    // alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = {}});

    devices.forEach(function(oneDevice) {
      if (oneDevice.choices[hash] && oneDevice.choices[hash].labels) {
        var labels = oneDevice.choices[hash].labels;
        labels.forEach(function(oneLabel) {
          if (oneLabel.label === label) {
            // console.log(oneDevice._id + " choose " + oneLabel.choice);
            // valueJSONObject[oneLabel.choice][oneDevice._id] = oneDevice;
            valueJSONObject[oneLabel.choice].push(oneDevice._id);
          }
        });
      }
    });
    // console.log(JSON.stringify(valueJSONObject));
    return valueJSONObject;
  },
  options: function() {
    var options = Object.keys(valueJSONObject).map(function(key) {
      return {
        key: key,
        value: valueJSONObject[key]
      };
    });
    return options;
  },
  option: function() {
    return this.key;
  },
  deviceList: function() {
    return this.value;
  },
  device: function() {
    return this;
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

    packageDocument.statements.some(function(oneStatement) {statement = oneStatement; return oneStatement.label === label;});
    var devices = Devices.find().fetch();
    alternatives = statement.alternatives;
    valueJSONObject = {};

    alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = []});
    // alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = {}});

    devices.forEach(function(oneDevice) {
      if (oneDevice.choices[hash] && oneDevice.choices[hash].labels) {
        var labels = oneDevice.choices[hash].labels;
        labels.forEach(function(oneLabel) {
          if (oneLabel.label === label) {
            // console.log(oneDevice._id + " choose " + oneLabel.choice);
            // valueJSONObject[oneLabel.choice][oneDevice._id] = oneDevice;
            valueJSONObject[oneLabel.choice].push(oneDevice._id);
          }
        });
      }
    });
    // console.log(JSON.stringify(valueJSONObject));

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

Template.config.events({
  'click .option': function(event, template) {
    var self = this;
    assignValue(null, self.key);
  },
  'click .assign': function(event, template) {
    var self = this;
    var deviceArray = [];
    var choiceArray = [];
    Object.keys(self).map(function(key) {
      deviceArray = deviceArray.concat(self[key]);
      choiceArray.push(key);
    });
    shuffle(deviceArray);
    shuffle(choiceArray);
    var ratio = Math.round(deviceArray.length / choiceArray.length);
    var chunks = split(deviceArray, ratio);
    var valueJSONObject = {};
    for (var i in choiceArray) {
      var choice = choiceArray[i];
      valueJSONObject[choice] = chunks[i];
    }
    assignValue(valueJSONObject, null);
  }
});
