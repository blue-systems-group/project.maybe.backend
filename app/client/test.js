Template.test.events({
    'click div': function(event, template) {
        console.log(event.target);
        console.log(template.data);
        if (event.target.tagName === "SPAN") {
            var parent = event.target.parentElement;
            console.log(parent);
            return;
        }
        event.target.classList.toggle("maybeCodeBlockChoosed");
    },

    'mouseenter div': function(event, template) {
        event.target.classList.add("maybeCodeBlockHover")
    },

    'mouseleave div': function(event, template) {
        event.target.classList.remove("maybeCodeBlockHover")
    },
});
