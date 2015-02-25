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
});

Template.deviceItem.events({
    'click': function() {
        this.values.button1 = !this.values.button1;
        this.values.button2 = !this.values.button2;
        this.values.button3 = !this.values.button3;
        this.values.button4 = !this.values.button4;
        Devices.update(this._id, this);
    }
});
