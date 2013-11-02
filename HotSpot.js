if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to HotSpot.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
  
  $(document).ready(function() {
    console.log('Hello!');
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
