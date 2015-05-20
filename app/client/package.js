Template.package.helpers({
  packageName: function() {
    return this._id;
  },
  hash: function() {
    return this.sha224_hash;
  },
  statements: function() {
    return this.statements;
  },
  content: function() {
    // return this.content;
    return this.content;
    // return this.content.replace(/(?:\r\n|\r|\n)/g, "</br>");
  },
  packageHtmlCode: function() {
    var root = document.createElement("div");
    var preNode = document.createElement("pre");
    preNode.className = "json";

    root.appendChild(preNode);

    var codeNode = document.createElement("code");
    codeNode.className = "json";

    preNode.appendChild(codeNode);

    codeNode.innerHTML = json2html.transform(this);
    hljs.highlightBlock(codeNode);

    return root.innerHTML;
  },
  alternatives: function() {
    var code = this.content;
    var label = this.label;
    var choice = 0;
    if (this.hasOwnProperty("choice")) {
      choice = this.choice;
    }
    var alternatives = [];
    var start = 0;
    for (var i in this.alternatives) {
      var alternative = this.alternatives[i];
      var alternativeJSON = {
        isAlternative: true,
        value: alternative.value,
        isChoosed: choice == alternative.value,
        label: label
      };
      alternatives.push(alternativeJSON);
    }
    return alternatives;
  },
  highlightedHtmlCode: function() {
    var code = this.content;
    var label = this.label;
    var choice = 0;
    if (this.hasOwnProperty("choice")) {
      choice = this.choice;
    }
    var root = document.createElement("div");
    root.className = "java";

    var preNode = document.createElement("pre");
    preNode.className = "java";

    root.appendChild(preNode);

    var codeNode = document.createElement("code");
    codeNode.className = "java";

    preNode.appendChild(codeNode);

    var start = 0;
    var trim = this.type === "block";
    this.alternatives.forEach(function(alternative) {
      var junction = code.substring(start, alternative.start);
      // junction = junction.replace(/(?:\r\n|\r|\n)/g, "</br>");
      start = alternative.start;
      var end = alternative.end;
      if (trim) {
        end -= 1;
        while (code.charAt(end - 1) === ' ' || code.charAt(end - 1) === '\t') {
          end -= 1;
        }
      }
      var block = code.substring(start, end);
      // var block = code.substring(alternative.start, alternative.end).replace(/(?:\r\n|\r|\n)/g, "</br>");
      start = end;

      var tmpJunction = document.createElement('div');
      tmpJunction.classList.add("maybeCodeJunction");
      // console.log(junction);
      tmpJunction.innerHTML = junction;
      codeNode.appendChild(tmpJunction);

      var tmpBlock = document.createElement('div');
      tmpBlock.classList.add("maybeCodeBlock");
      if (choice === alternative.value) {
        tmpBlock.classList.add("maybeCodeBlockChoosed");
      }
      tmpBlock.innerHTML = block;
      codeNode.appendChild(tmpBlock);
    });
    var junction = code.substring(start);
    var tmpJunction = document.createElement('div');
    tmpJunction.classList.add("maybeCodeJunction");
    tmpJunction.innerHTML = junction;
    codeNode.appendChild(tmpJunction);

    hljs.highlightBlock(codeNode);
    return root.innerHTML;
  }
});

Template.package.events({
  'click .option': function(event, template) {
    console.log(event);
    console.log(JSON.stringify(this));
    var choice = this.value;
    console.log("choice: " + choice);
    console.log("label: " + this.label);

    var onePackage = template.data;
    for (var i in onePackage.statements) {
      var label = onePackage.statements[i].label;
      if (label === this.label) {
        console.log("write option");
        onePackage.statements[i].choice = choice;
        break;
      }
    }
    MetaData.update(onePackage._id, onePackage);
  },
  'click .config': function(event, template) {
    var package = template.data;
    var packageName = package.package;
    Session.set("selectPackage", packageName);
    var hash = package.sha224_hash;
    Session.set("selectHash", hash);
    var devices = Devices.find().fetch();
    var statement = this;
    var label = this.label;
    Session.set("selectLabel", label);

    // Custombox.open({
    //   target: '#config-container',
    //   effect: 'flip',
    //   speed: 50
    // });

    // // this = {
    // //   isAlternative: true,
    // //   value: alternative.value,
    // //   isChoosed: choice == alternative.value,
    // //   label: label
    // // };

    // var alternatives = statement.alternatives;
    // var valueJSONObject = {};
    // alternatives.forEach(function(oneAlternative) {valueJSONObject[oneAlternative.value] = []});

    // console.log("package name: " + packageName);
    // console.log("label: " + label);
    // console.log("choice: " + this.choice);

    // devices.forEach(function(oneDevice) {
    //   if (oneDevice.choices[hash] && oneDevice.choices[hash].labels) {
    //     var labels = oneDevice.choices[hash].labels;
    //     labels.forEach(function(oneLabel) {
    //       if (oneLabel.label === label) {
    //         console.log(oneDevice._id + " choose " + oneLabel.choice);
    //         valueJSONObject[oneLabel.choice].push(oneDevice._id);
    //       }
    //     });
    //   }
    // });
    // console.log(JSON.stringify(valueJSONObject));

    // // var target = event.target;
    // // console.log(event);
    // // console.log(event.toElement);
  },
  'click .packageName': function(event, template) {
    console.log(event.target.innerHTML);
    template.$('.packageDetail').toggle(1000);
  }

  // 'click .maybeCodeBlock': function(event, template) {
  //     console.log(event.target);
  //     console.log(JSON.stringify(this));
  //     // var choice = this.value;
  //     // console.log("choice: " + choice);
  //     // console.log("label: " + this.label);

  //     // var onePackage = template.data;
  //     // for (var i in onePackage.statements) {
  //     //     var label = onePackage.statements[i].label;
  //     //     if (label === this.label) {
  //     //         console.log("write option");
  //     //         onePackage.statements[i].choice = choice;
  //     //         break;
  //     //     }
  //     // }
  //     // MetaData.update(onePackage._id, onePackage);
  // },
});
