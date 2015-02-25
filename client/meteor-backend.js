if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);

    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

    Template.hello.events({
        'click .button': function () {
            // increment the counter when button is clicked
            Session.set('counter', Session.get('counter') + 1);
        }
    });

    Template.api.events({
        'click .button': function(){
            var api = $('#api-content');
            api.toggleClass('hidden');
        }

    });

    hljs.initHighlightingOnLoad();


    // if(!window.jQuery)
    // {
    //     alert('jquery');
    // } else {
    //     alert('click');
    // }


}
