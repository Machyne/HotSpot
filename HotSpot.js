Spots = new Meteor.Collection("spots"); //model

if (Meteor.isClient) {
  Spots.find().observeChanges( {
    added: function(id, fields) {
      console.log("hi");
    },

    removed: function(id) {
      console.log("bye");
    }
  });
  Meteor.startup( function () {
    Maps.init();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
