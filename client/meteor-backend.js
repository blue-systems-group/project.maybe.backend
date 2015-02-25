Template.api.events({
    'click #api-title': function(){
        var api = $('#api-content');
        api.toggleClass('hidden');
        api.toggleClass('show');
    }
});

Template.devicesList.helpers({
    devices: function() {
        return Devices.find();
    }
});

hljs.initHighlightingOnLoad();
