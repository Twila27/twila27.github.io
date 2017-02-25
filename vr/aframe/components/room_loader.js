import * as RoomDataConfig from 'assets/roomData.json';

AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    init: function() {
      console.log(RoomDataConfig);
    }
  }
);
