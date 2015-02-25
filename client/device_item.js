Template.deviceItem.helpers({
    deviceid: function() {
        return this.deviceid;
    },
    button1: function() {
        return this.values.button1.toString();
    },
    button2: function() {
        return this.values.button2.toString();
    },
    button3: function() {
        return this.values.button3.toString();
    },
    button4: function() {
        return this.values.button4.toString();
    },
    color: function() {
        return this.values.color.toString();
    },
});

Template.deviceItem.events({
    'click .button': function(event) {
        var button = event.target.getAttribute("id");
        // for (var key in this.values) {
        //     if (this.values.hasOwnProperty(key)) {
        //         alert(key + " -> " + this.values[key]);
        //     }
        // }
        this.values[button] = !this.values[button];
        Devices.update(this._id, this);

        // this.values.button1 = !this.values.button1;
        // this.values.button2 = !this.values.button2;
        // this.values.button3 = !this.values.button3;
        // this.values.button4 = !this.values.button4;
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
