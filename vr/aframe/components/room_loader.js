AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomData : { default : "",
                   parse : function(value) {
                     if ( value === "" )
                         return "";
                     var roomDataObj = JSON.parse( value );
                     return roomDataObj;
                   },
                   stringify : JSON.stringify
                 }
    },
    init: function() {
      console.log(this.data.roomData);
    }
  }
);
