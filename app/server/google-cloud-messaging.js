Meteor.methods({
// curl --header 'Authorization: key=AIzaSyC7tvl67Wlq7b0Exdf1vVE0496voBRJZnY' --header Content-Type:'application/json' https://android.googleapis.com/gcm/send -d '{"registration_ids" : ["APA91bGUqidKEZ9n2ch_ABDZIhrVkiDQVTpnSxoa43HDdjFwrlPtk7kSx51DRVRMojk9wVYt3-eGTG6FHGGklgH0h1xJqmEu-_vQbzuD6ytoHXFgbu1V8vuqvI09usMBv3OeBXhzC4598tvh-MFezolkkqFVzJSz6WK0qqbEBu5Yz97zYCtWKqrhd-P_6vV8vM-M7TurA4AH"], "data" : { "a" : "a", "b": "b"}}'
    remoteGet: function(url,options) {
        console.log("remoteGet");
        return HTTP.get(url,options);
    },
    sendNotification: function(device) {
        console.log("sendNotification");
        console.log(JSON.stringify(device));
        console.log(device.gcmid);
        var gcmid = device.gcmid;
        if (gcmid === undefined) {
            console.log("No gcmid for " + device.deviceid);
            return;
        }

        HTTP.call("POST", "https://android.googleapis.com/gcm/send",
                  {
                      data: {
                          registration_ids: [gcmid],
                          data: {
                              "a" : "a",
                              "b": "b"
                          }
                      },
                      headers: {
                          Authorization: "key=AIzaSyC7tvl67Wlq7b0Exdf1vVE0496voBRJZnY",
                          "Content-Type": "application/json",
                      }
                  },
                  function (error, result) {
                      if (!error) {
                          // console.log(result);
                      } else {
                          console.log("error: " + error);
                      }
                  });
    }
});
