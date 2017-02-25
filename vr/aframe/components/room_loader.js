AFRAME.registerComponent( 'room_loader', { //If we use hyphens, can't access as "node.room-loader."
    schema: {
      roomData : { default : "",
                   parse : function(jsonPath) {
                     if ( jsonPath === "" )
                         return "";
                     
                     function loadJSON(path)
                     {
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
                     }
                     
                     var jsonData = loadJSON( jsonPath );
                     var roomDataObj = JSON.parse( jsonPath );
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
