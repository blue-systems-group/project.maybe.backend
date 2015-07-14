Template.nav.onCreated(function() {
  if (location.hash !== '') {
    Session.setDefault('activeNav', location.hash);
  } else if (location.pathname === '/') {
    Session.setDefault('activeNav', '/');
  } else {
    var fields = location.pathname.split('/');
    Session.setDefault('activeNav', fields[1]);
  }
});

Template.nav.events({
  'click .nav a': function(event, template) {
    Session.set('activeNav', this.href);
  }
});

function getLink(name, href) {
  return {name: name, href: href};
}

Template.nav.helpers({
  links: function() {
    var links = [];
    links.push(getLink('Maybe Backend', '/'));
    links.push(getLink('Packages', '#packages-container'));
    links.push(getLink('Devices', '#devices-container'));
    links.push(getLink('RESTful API', 'api'));
    links.push(getLink('Contact', '#contact'));
    return links;
  },
  active: function() {
    return Session.get('activeNav') === this.href;
  }
});
