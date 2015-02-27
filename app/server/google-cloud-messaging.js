Meteor.methods({
    remoteGet: function(url,options) {
        console.log("remoteGet");
        return HTTP.get(url,options);
    }
});
