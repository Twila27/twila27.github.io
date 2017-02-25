AFRAME.registerComponent( 'room_loader', //If we use hyphens, can't access as "node.room-loader."
  {
    schema: 
    {
      roomDataPath : { default : "" }
    },
    setRoomData: function(parsedJSON) 
    {
        this.roomData = parsedJSON;
        console.log("HIT:");
        console.log(this.roomData);
    },
    ajaxRequest: function(componentSelf)
    {
      if (xhr.readyState === XMLHttpRequest.DONE) 
      {
        if (xhr.status === 200) 
        {
          var jsonObj = JSON.parse( xhr.responseText );
          componentSelf.setRoomData(jsonObj);
        }
        else console.error(xhr);
      }
    },
    loadJSON: function(componentSelf, path)
    {
       if ( path === "" )
       {
           console.log("room_loader does not have a roomDataPath!");
           return;
       }
        
       var xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function() { componentSelf.ajaxRequest(xhr); }
       xhr.open("GET", path, true);
       xhr.send();
    },
    init: function() 
    {
      this.loadJSON(this, this.data.roomDataPath);
    }
  }
);
