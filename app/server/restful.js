function updateOneDevice(device, packageList) {
    if (device.queryCount === undefined) {
        device.queryCount = 1;
    } else {
        device.queryCount = device.queryCount + 1;
    }

    var choices = {};
    for (i in packageList) {
        console.log(i);
        onePackage = packageList[i];
        hash = onePackage.sha224_hash;
        array = [];

        for (j in onePackage.statements) {
            statement = onePackage.statements[j];
            if (statement.choice === undefined) {
                statement.choice = 0;
            }
            label = {
                "label": statement.label,
                "choice": statement.choice
            }
            array.push(label);
        }
        choices[hash] = {
            name: onePackage.package,
            labels: array
        }
    }

    device.choices = choices;

    console.log(device);
    Devices.update(device._id, device);
}

Meteor.startup(function () {
    maybeAPIv1 = new CollectionAPI({
        authToken: undefined,              // Require this string to be passed in on each request
        apiPath: 'maybe-api-v1',          // API path prefix
        standAlone: false,                 // Run as a stand-alone HTTP(S) server
        sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
        listenPort: 3005,                  // Port to listen to (stand-alone only)
        listenHost: undefined,             // Host to bind to (stand-alone only)
        privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
        certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
    });

    maybeAPIv1.addCollection(Devices, 'devices', {
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
                packageList = MetaData.find().fetch();
                console.log(packageList.length);
                if (objs.length > 0) {
                    for (i in objs) {
                        var device = objs[i];
                        updateOneDevice(device, packageList);
                    }
                }
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

    maybeAPIv1.addCollection(MetaData, 'metadata', {
        // All values listed below are default
        authToken: undefined,                   // Require this string to be passed in on each request
        methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
        before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection. If the function returns false the action will be canceled, if you return true the action will take place.
            POST: function(obj) {
                console.log('POST');
                // set id for that
                var id = "sha224_hash";
                if (obj.hasOwnProperty(id)) {
                    obj._id = obj[id];
                    console.log("valid");
                    return true;
                } else {
                    console.log("invalid");
                    return false;
                }
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
    maybeAPIv1.start();
});
