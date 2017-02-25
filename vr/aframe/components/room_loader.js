AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomData : { default : "",
                   parse : function(value) {
                     var roomDataObj = JSON.parse( value );
                     return roomDataObj;
                   }
                 }
    },
    init: function() {
      console.log(this.data.roomData);
    }
  }
);
