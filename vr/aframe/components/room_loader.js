AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomDataPath : { default : "" }
    },
    setRoomData: function(parsedJSON) {
        this.roomData = parsedJSON;
        console.log("HIT:");
        console.log(this.roomData);
    },
    loadJSON : function(componentSelf, path) {
       if ( path === "" )
       {
           console.log("room_loader does not have a roomDataPath!");
           return;
       }
       var success = function(componentSelf, data) { componentSelf.setRoomData(data); };
       var error = function(xhr) { console.error(xhr); };

       var xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function(componentSelf)
       {
         if (xhr.readyState === XMLHttpRequest.DONE) {
           if (xhr.status === 200) {
             if (success) {
               success(componentSelf, JSON.parse(xhr.responseText));
             }
           } else {
             if (error) {
               error(xhr);
             }
           }
         }
       };
       xhr.open("GET", path, true);
       xhr.send();
    },
    init: function() {
      this.loadJSON(this, this.data.roomDataPath);
    }
  }
);
