Meteor.startup(function () {
    devicesAPI = new CollectionAPI({
        authToken: undefined,              // Require this string to be passed in on each request
        apiPath: 'maybe-api-v1',          // API path prefix
        standAlone: false,                 // Run as a stand-alone HTTP(S) server
        sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
        listenPort: 3005,                  // Port to listen to (stand-alone only)
        listenHost: undefined,             // Host to bind to (stand-alone only)
        privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
        certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
    });

    // Add the collection Players to the API "/players" path
    devicesAPI.addCollection(Devices, 'devices', {
        // All values listed below are default
        authToken: undefined,                   // Require this string to be passed in on each request
        methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
        before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection. If the function returns false the action will be canceled, if you return true the action will take place.
            POST: function(obj) {
                console.log('POST');
                obj._id = obj.deviceid;
                return true;
            }, // function(obj) {return true/false;},
            GET: function(collectionid, objs) {
                console.log('GET');
                console.log(objs);
                return true;
            }, // function(collectionID, objs) {return true/false;},
            PUT: function(collectionID, obj, newValues) {
                console.log('PUT');
                console.log(collectionID);
                console.log(obj);
                console.log(newValues);
                return true;
            },  //function(collectionID, obj, newValues) {return true/false;},
            DELETE: function(collectionID, obj) {
                console.log('DEL');
                if (obj === undefined) {
                    return false;
                }
                return true;
            },  //function(collectionID, obj) {return true/false;}
        }
    });

    // Starts the API server
    devicesAPI.start();
});
