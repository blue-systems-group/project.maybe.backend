Template.deviceItem.helpers({
  deviceid: function() {
    return this.deviceid;
  },
  values: function() {
    var array = [];
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        var value = this[key];
        var object = {
          "key" : key,
          "value" : JSON.stringify(this[key]),
          "choosed" : false
        };
        array.push(object);
      }
    }
    return array;
  },
  deviceHtmlCode: function() {
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

    codeNode.innerHTML = json2html.transform(this);
    hljs.highlightBlock(codeNode);

    // this._id = id;
    // this.gcmid = gcmid;
    return root.innerHTML;
  }
});

Template.deviceItem.events({
  'click .button': function(event) {
    Meteor.call('sendNotification', this);
  },

  'click .deviceID': function(event, template) {
    alert("Click deviceID");
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
  },

  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once
  // every 300ms)
  'keyup input[type=text]': _.throttle(function(event) {
    Devices.update(this._id, {$set: {'values.color': event.target.value}});
  }, 300)
});
