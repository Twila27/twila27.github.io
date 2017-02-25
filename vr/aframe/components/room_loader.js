AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomData : { default : {},
                   parse : JSON.parse,
                   stringify : JSON.stringify
                 }
    },
    init: function() {
      console.log(this.data.roomData);
    }
  }
);
