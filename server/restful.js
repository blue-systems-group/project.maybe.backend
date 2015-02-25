function get(collectionid, objs) {
    console.log('get');
    console.log(objs);
    return true;
}

function post(obj) {
    console.log('post');
    obj._id = obj.deviceid;
    return true;
}

function put(collectionID, obj, newValues) {
    console.log('put');
    console.log(collectionID);
    console.log(obj);
    console.log(newValues);
    return true;
}

function del(collectionID, obj) {
    console.log('del');
    if (obj === undefined) {
        return false;
    }
    return true;
}

if (Meteor.isServer) {
    Meteor.startup(function () {

        // All values listed below are default
        collectionApi = new CollectionAPI({
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
        collectionApi.addCollection(Devices, 'devices', {
            // All values listed below are default
            authToken: undefined,                   // Require this string to be passed in on each request
            methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
            before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection. If the function returns false the action will be canceled, if you return true the action will take place.
                POST: post,  // function(obj) {return true/false;},
                GET: get,  // function(collectionID, objs) {return true/false;},
                PUT: put,  //function(collectionID, obj, newValues) {return true/false;},
                DELETE: del,  //function(collectionID, obj) {return true/false;}
            }
        });

        // Starts the API server
        collectionApi.start();
    });
}
