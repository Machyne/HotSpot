Spots = new Meteor.Collection("spots"); //model

if (Meteor.isClient) {
  Spots.find().observeChanges( {
    added: function(id, fields) {
      fields.id = id;
      Maps.addPoint(fields);
    },

    removed: function(id) {
      Maps.removePoint(id);
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
