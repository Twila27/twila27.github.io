AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomDataPath : { default : "" }
    },
    loadJSON : function(path)
    {
       if ( path === "" )
       {
           console.log("room_loader does not have a roomDataPath!");
           return;
       }
       var success = function(data) { console.log(data); };
       var error = function(xhr) { console.error(xhr); };

       var xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function()
       {
         if (xhr.readyState === XMLHttpRequest.DONE) {
           if (xhr.status === 200) {
             if (success) {
               success(JSON.parse(xhr.responseText));
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
      this.loadJSON(this.data.roomDataPath);
    }
  }
);
