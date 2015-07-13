Template.nav.events({
  'click .nav a': function(event, template) {
    template.$('.nav').find('.active').removeClass('active');
    template.$(event.target).parent().addClass('active');
  }
});
