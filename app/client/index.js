Template.api.events({
    'click #api-title': function(){
        var api = $('#api-content');
        api.toggleClass('hidden');
        api.toggleClass('show');
    }
});

hljs.initHighlightingOnLoad();

Template.devicesList.helpers({
    devices: function() {
        return Devices.find();
    }
});
