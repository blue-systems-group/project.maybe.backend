APIKeys = new Meteor.Collection('APIKeys');

Accounts.onCreateUser(function(options, user) {
  Meteor.call('initApiKey', user._id );
  return user;
});

function insertOrUpdate(userId) {
  var newKey = Random.hexString( 32 );
  try {
    if (APIKeys.findOne({ "owner": userId })) {
      var keyId = APIKeys.update({"owner": userId}, {
        $set: {
          "key": newKey
        }
      });
      return keyId;
    } else {
      var key = APIKeys.insert({
        "owner": userId,
        "key": newKey
      });
      return key;
    }
  } catch(exception) {
    return exception;
  }
}

Meteor.methods({
  initApiKey: function(userId) {
    check( userId, Match.OneOf( Meteor.userId(), String ) );
    return insertOrUpdate(userId);
  },
  regenerateApiKey: function( userId ){
    check( userId, Meteor.userId() );
    return insertOrUpdate(userId);
  }
});

Meteor.publish('APIKey', function(){
  var user = this.userId;
  var data = APIKeys.find( { "owner": user }, {fields: { "key": 1 } } );

  if ( data ) {
    return data;
  }

  return this.ready();
});
