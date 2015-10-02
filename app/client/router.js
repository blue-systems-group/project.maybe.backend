Meteor.startup(function() {
  Router.onBeforeAction(function() {
    if (!Meteor.userId()) {
      this.render('login');
    } else {
      this.next();
    }
  });

  Router.configure({
    notFoundTemplate: "Home"
  });

  Router.route('/', function () {
    this.render('Home');
  });

  Router.route('/api', function () {
    this.render('api');
  });

  Router.route('/logs', function () {
    this.render('logs');
  });

  Router.route('/logs/:packageName', {
    data: function() {
      return {_id: this.params.packageName, alone: true};
    },
    waitOn: function() {
      return Meteor.subscribe('packageLogIndex', this.params.packageName);
    },
    action: function() {
      this.render('log_package');
    }
  });

  Router.route('/logs/:packageName/:deviceid', function () {
    this.render('showLog', {data: {packageName: this.params.packageName, deviceid: this.params.deviceid}});
  });
});
