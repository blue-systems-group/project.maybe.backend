Template.device.onCreated(function() {
  subscribeActualCollection(this);
});

Template.device.helpers({
  deviceid: function() {
    var collection = Template.instance().collection;
    var record = collection.findOne('0');
    return record && record.device && record.device.deviceid;
  },
  packages: function() {
    var collection = Template.instance().collection;
    var record = collection.findOne('0');
    var choices = record && record.device && record.device.choices;

    return choices;
  },
  hasGCMid: function() {
    var collection = Template.instance().collection;
    var record = collection.findOne('0');
    return record && record.device && record.device.hasOwnProperty('gcmid');
  },
  deviceHtmlCode: function() {
    var collection = Template.instance().collection;
    var record = collection.findOne('0');

    var root = document.createElement("div");
    var preNode = document.createElement("pre");
    preNode.className = "json";

    root.appendChild(preNode);

    var codeNode = document.createElement("code");
    codeNode.className = "json";

    preNode.appendChild(codeNode);

    // id = this._id;
    // gcmid = this.gcmid;
    // delete this._id;
    // delete this.gcmid;

    var jsonObject = record && record.device;
    codeNode.innerHTML = json2html.transform(jsonObject);
    hljs.highlightBlock(codeNode);

    // this._id = id;
    // this.gcmid = gcmid;
    return root.innerHTML;
    // return 'deviceHtmlCode';
  }
});

Template.device.events({
  'click .button': function(event) {
    var record = Template.instance().collection.findOne('0');
    Meteor.call('sendNotification', record.device);
  },

  'click .deviceID': function(event, template) {
    var deviceDetail = template.$('.deviceDetail');
    deviceDetail.toggle(Session.get('toggleDuration'));
  },

  'click .key-value-pair' : function(event, template) {
    // var key = this.key;
    // var device = template.data;
    // console.log(JSON.stringify(device));
    // for (var i in device.values) {
    //     if (device.values.hasOwnProperty(i)) {
    //         console.log(key);
    //         console.log(i);
    //         if (key === i) {
    //             console.log("TRUE");
    //             device.values[i] = true;
    //         } else {
    //             console.log("false");
    //             device.values[i] = false;
    //         }
    //     }
    // }
    // Devices.update(device._id, device);
  },

  'keydown input[type=text]': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  }
  // },

  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once
  // every 300ms)
  // 'keyup input[type=text]': _.throttle(function(event) {
  //   Devices.update(this._id, {$set: {'values.color': event.target.value}});
  // }, 300)
});


Template.devicePackage.helpers({
  packageName: function () {
    var name = this.packageName || 'unknow package name';
    return name;
  },
  choices: function() {
    var self = this;
    var metadata = {'package': this.packageName};
    var array = _.values(this.labelJSON);
    _.each(array,
      function(obj) {
        return _.extend(obj, this);
      },
      metadata)
    return array;
    // return _.values(this.labelJSON);
  },
  choice: function() {
    return this.choice;
  },
  label: function() {
    return this.label;
  },
  range: function() {
    return this.range - 1;
  }
});

Template.device.events({
  'change input[type="range"]': function(event, target) {
    var deviceID = target.data._id;
    var packageName = this.package;
    var label = this.label;
    var choice = parseInt($(event.target).val());
    $(event.target).prop('disabled', true).addClass('disabled');
    Meteor.call('updateChoice', deviceID, packageName, label, choice, (error, result) => {
      //function to update UI
      if (error) {
        console.log('change choice get error:', error);
        return;
      }
      $(event.target).prop('disabled', false).removeClass('disabled');
    });
  },
});
