Template.package.helpers({
    packageName: function() {
        return this.package;
    },
    hash: function() {
        return this.sha224_hash;
    },
    statements: function() {
        return this.statements;
    },
    content: function() {
        // return this.content;
        return this.content.replace(/(?:\r\n|\r|\n)/g, "</br>");
    },
    alternatives: function() {
        var code = this.content;
        var label = this.label;
        var choice = 0;
        if (this.hasOwnProperty("choice")) {
            console.log("have choice");
            choice = this.choice;
        } else {
            console.log("don't have choice");
        }
        var array = [];
        var start = 0;
        for (var i in this.alternatives) {
            var alternative = this.alternatives[i];
            var junction = code.substring(start, alternative.start);
            var block = code.substring(alternative.start, alternative.end);
            start = alternative.end;
            var junctionJSON = {
                "code": junction.replace(/(?:\r\n|\r|\n)/g, "</br>"),
                "isAlternative": false
            }
            array.push(junctionJSON);
            var alternativeJSON = {
                "code": block.replace(/(?:\r\n|\r|\n)/g, "</br>"),
                "isAlternative": true,
                "value": alternative.value,
                "isChoosed": choice == alternative.value,
                "label": label,
            }
            array.push(alternativeJSON);
        }
        var junction = code.substring(start);
        var junctionJSON = {
            "code": junction,
            "isAlternative": false
        }
        array.push(junctionJSON);
        console.log(array);
        return array;
    },
    // isAlternative: function() {
    //     return this.isAlternative;
    // },
    // code: function() {
    //     return this.code;
    // },
    // isChoosed: function() {
    //     return this.isChoosed;
    // },
    // value: function() {
    //     return this.value;
    // }
});

Template.package.rendered = function() {
    // TODO: need rewrite only render self block.
    // $('pre code').each(function(i, block) {
    //     hljs.highlightBlock(block);
    // });
};

Template.package.events({
    'click .maybeCodeBlock': function(event, template) {
        var node = event.target;
        while (node.tagName !== "DIV") {
            node = node.parentNode;
        }
        if (node.classList.contains("maybeCodeBlockChoosed")) {
            return;
        }
        // node.classList.toggle("maybeCodeBlockChoosed");
        var choice = this.value;
        console.log("choice: " + choice);
        console.log("label: " + this.label);

        var onePackage = template.data;
        for (var i in onePackage.statements) {
            var label = onePackage.statements[i].label;
            if (label === this.label) {
                onePackage.statements[i].choice = choice;
                break;
            }
        }
        MetaData.update(onePackage._id, onePackage);
    },

    // 'mouseenter .maybeCodeBlock': function(event, template) {
    //     event.target.classList.add("maybeCodeBlockHover")
    // },

    // 'mouseleave .maybeCodeBlock': function(event, template) {
    //     event.target.classList.remove("maybeCodeBlockHover")
    // },
});
