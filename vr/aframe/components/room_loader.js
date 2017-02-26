AFRAME.registerComponent( 'room_loader', //If we use hyphens, can't access as "node.room-loader."
  {
    schema: 
    {
      roomDataPath : { default : "" }
    },
    getRoomNameFromID: function(id)
    {
      return 'room' + id;
    },
    unloadRoom: function( newRoomID ) 
    {
      if ( ( newRoomID < 1 ) || ( newRoomID > this.roomData.length ) )
        return;
      
      console.log("UNLOADROOM " + newRoomID );
    },
    loadRoom: function( newRoomID ) 
    {
      if ( ( newRoomID < 1 ) || ( newRoomID > this.roomData.length ) )
        return;
      
      console.log("LOADROOM " + newRoomID );      
//    this.el.sceneEl.components.samsara_global.incrementNumSpawnersInRoom();      
    },
    loadNextRoom: function( newRoomID ) 
    {
      var dir = ( ( newRoomID - this.currentRoom ) > 0 ? 1 : -1 ); //e.g. Room 2 to 3 => forward.
      unloadRoom( newRoomID - 2*dir ); //In room 3, unload room 3-2=1 (forward) or 3+2=5 (backward) via dir var.
      loadRoom( newRoomID ); //Else we never load the first room!
      loadRoom( newRoomID + dir );
    },
    setRoomData: function( parsedJSON ) 
    {
        this.roomData = parsedJSON;
        console.log( "HIT:" );
        console.log( this.roomData );
    },
    ajaxRequest: function( componentSelf, xhr )
    {
      if (xhr.readyState === XMLHttpRequest.DONE) 
      {
        if (xhr.status === 200) 
        {
          var jsonObj = JSON.parse( xhr.responseText );
          componentSelf.setRoomData( jsonObj );
        }
        else console.error( xhr );
      }
    },
    loadJSON: function( componentSelf, path )
    {
       if ( path === "" )
       {
           console.log("room_loader does not have a roomDataPath!");
           return;
       }
        
       var xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function() { componentSelf.ajaxRequest( componentSelf, xhr ); };
       xhr.open( "GET", path, true );
       xhr.send();
    },
    init: function() 
    {
      this.el.addEventListener( 'door_opened', function(doorID) { self.loadNextRoom(doorID) } );
      
      this.loadJSON( this, this.data.roomDataPath );
      
      this.currentRoom = 0;
      const FIRST_ROOM_ID = 1;
      this.loadNextRoom( FIRST_ROOM_ID );
    }
  }
);
