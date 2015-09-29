Template.nav.onCreated(function() {
  if (location.hash !== '') {
    Session.setDefault('activeNav', location.hash);
  } else if (location.pathname === '/') {
    Session.setDefault('activeNav', '/');
  } else {
    var fields = location.pathname.split('/');
    Session.setDefault('activeNav', '/' + fields[1]);
  }

  Deps.autorun(function() {
    if(Session.get('didScroll')) {
      hasScrolled();
      Session.set('didScroll', false);
    }
  });
});

Template.nav.events({
  'click .nav a': function(event, template) {
    Session.set('activeNav', this.href);
    template.$('.navbar-collapse').collapse('hide');
  },
  'click .navbar-brand': function(event, template) {
    Session.set('activeNav', '/');
  }
});

function getLink(name, href) {
  return {name: name, href: href};
}

Template.nav.helpers({
  links: function() {
    var links = [];
    links.push(getLink('Home', '/'));
    links.push(getLink('Packages', '/#packages-container'));
    links.push(getLink('Devices', '/#devices-container'));
    links.push(getLink('Logs', '/logs'));
    links.push(getLink('RESTful API', 'https://blue-systems-research-group.gitbooks.io/maybe/content/backend-server/index.html'));
    links.push(getLink('Contact', 'http://blue.cse.buffalo.edu/people/ychen78/'));
    return links;
  },
  active: function() {
    return Session.get('activeNav') === this.href;
  }
});

// Hide Header on on scroll down
// inspired by https://medium.com/@mariusc23/hide-header-on-scroll-down-show-on-scroll-up-67bbaae9a78c
var lastScrollTop = 0;
var delta = 32;

function hasScrolled() {
  var st = Math.max($(this).scrollTop(), 0);

  if(Math.abs(lastScrollTop - st) <= delta) {
    return;
  }

  if (st > lastScrollTop) {
    $('.navbar').fadeOut(500);
  } else {
    $('.navbar').show();
  }

  lastScrollTop = st;
}
