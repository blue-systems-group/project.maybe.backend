Template.deviceItem.helpers({
    deviceid: function() {
        return this.deviceid;
    },
    values: function() {
        var array = [];
        for (var key in this.values) {
            if (this.values.hasOwnProperty(key)) {
                var value = this.values[key];
                var object = {
                    "key" : key,
                    "value" : this.values[key],
                    "choosed" : this.values[key]
                }
                // alert(key + " -> " + this.values[key]);
                array.push(object);
            }
        }
        return array;
    },
});

Template.deviceItem.events({
    // 'click .button': function(event) {
    //     var button = event.target.getAttribute("id");
    //     this.values[button] = !this.values[button];
    //     Devices.update(this._id, this);

    //     // this.values.button1 = !this.values.button1;
    //     // this.values.button2 = !this.values.button2;
    //     // this.values.button3 = !this.values.button3;
    //     // this.values.button4 = !this.values.button4;
    // },

    'click .deviceID': function(event, template) {
        alert("Click deviceID");
    },

    'click .key-value-pair' : function(event, template) {
        // Meteor.call('remoteGet','http://maybe.xcv58.me/maybe-api-v1/devices', {
        //     //...options...
        // }, function(error,response){
        //     if (!error) {
        //         console.log("GET Error!");
        //         alert(JSON.stringify(response));
        //     } else {
        //         alert(error);
        //     }
        //     //if an error happened, error argument contains the details
        //     //if the request succeeded, the response will contain the response of the server request
        // });
        var key = this.key;
        var device = template.data;
        console.log(key);
        console.log(JSON.stringify(device));
        device.values[key] = !device.values[key];
        Devices.update(device._id, device);
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
    }, 300),
});
