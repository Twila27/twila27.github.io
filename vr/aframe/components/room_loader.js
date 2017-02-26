const WORLD_OFFSET_FROM_ORIGIN = 100;

AFRAME.registerComponent( 'room_loader', //If we use hyphens, can't access as "node.room-loader."
  {
    schema: 
    {
      roomDataPath : { default : '' },
      doorNodeMixin : { default : 'gazetimerFoePrefab' },
      doorNodeAppearedSoundName : { type : 'string', default : 'doorNodeAppeared' },
      doorOpenSoundName : { type : 'string', default : 'doorOpen' }
    },
    getFoePrefabNameFromJSON: function(jsonVal) //In future, expose via schema taking object!
    {
      switch(jsonVal) {
        case 'spider' : return 'spiderFoePrefab';
        default : return 'gazetimerFoePrefab';
      }
    },
    addSpecialComponents: function( el, elData, newRoomID )
    {
      //This is where we'll attach other .js components if we match elData.obj's string value.
      var name = elData.obj.toLowerCase();
      switch (name) {
        case 'exit':
        case 'doubledoors':
        case 'door':
          el.setAttribute( 'door_opener', {
            nodeMixin: this.data.doorNodeMixin,
            doorNodeAppearedSoundName: this.data.doorNodeAppearedSoundName,
            doorOpenSoundName: this.data.doorOpenSoundName,
            doorRoomID: newRoomID
          });
          break;
        case 'spawner':
          el.setAttribute( 'spawns-foes', {
            nodeMixin: this.getFoePrefabNameFromJSON( elData.spawnType ), //What to spawn.
            numToSpawn: ( elData.numSpawns === undefined ) ? 1 : elData.numSpawns, //Per trip through the room, since room_loader recreates it.
          });
          this.el.sceneEl.components.samsara_global.incrementNumSpawnersInRoom();  
          break;
        case 'end':
        case 'endgate':
          el.setAttribute( 'endgate' );
          break;
        case 'floor':
          el.className = 'floor';
          break;
        default:
          break;
      }
    },
    parsePosition: function(str, delimiter = ' ') //Expects "x y z"
    {
      var currentPositionArray = str.split(delimiter);
      return {
        x: parseFloat( currentPositionArray[0] ),
        y: parseFloat( currentPositionArray[1] ),
        z: parseFloat( currentPositionArray[2] )
      };
    },
    getRoomNameFromID: function(id)
    {
      return 'room' + id;
    },
    getMeshNameFromJSON: function(jsonVal) 
    {
      return '#' + jsonVal + '-obj'; //Assumes this id exists in a-assets.
    },
    getMaterialNameFromJSON: function(jsonVal) 
    {
      return '#' + jsonVal + '-mtl'; //Assumes this id exists in a-assets.
    },
    unloadRoom: function( newRoomID ) 
    {
      if ( ( newRoomID < 1 ) || ( newRoomID > this.rooms.numRooms ) )
        return;
      
      console.log("UNLOADROOM " + newRoomID );
      console.log("UNIMPLEMENTED!" );
    },
    getKeysWorldPosition: function( jsonPosition ) 
    {
      var keysPos = jsonPosition;
      keysPos.x -= WORLD_OFFSET_FROM_ORIGIN;
      return keysPos;
    },
    getFoesWorldPosition: function( jsonPosition ) 
    {
      var foesPos = jsonPosition;
      foesPos.x += WORLD_OFFSET_FROM_ORIGIN;
      return foesPos;
    },
    loadRoom: function( newRoomID ) 
    {
      if ( ( newRoomID < 1 ) || ( newRoomID > this.rooms.numRooms ) )
        return;
      
      console.log("LOADROOM " + newRoomID );   
      var roomName = this.getRoomNameFromID( newRoomID );
      var roomObjects = this.rooms.data[roomName];
      for ( i = 0; i < roomObjects.length; i++ )
      {
        const elData = roomObjects[i];
        var el = document.createElement('a-entity');
        var dataPosition = this.parsePosition( elData.position );
        el.setAttribute( 'position', this.getKeysWorldPosition( dataPosition ) );
        
        if ( elData.obj !== undefined )
          el.setAttribute( 'obj-model', { 
            obj: this.getMeshNameFromJSON( elData.obj ), 
            mtl: this.getMaterialNameFromJSON( elData.obj  )
          } );
        else
          el.setAttribute( 'geometry', { primitive : 'torusKnot' } );

        el.setAttribute( 'scale', '.25 .25 .25' );

        this.addSpecialComponents( el, elData, newRoomID );
        this.el.sceneEl.appendChild( el );
        
        var foesWorldCopyEl = el.clone(true);
        foesWorldCopyEl.setAttribute( 'position', this.getFoesWorldPosition( dataPosition ) );
        this.el.sceneEl.appendChild( foesWorldCopyEl );
      }    
    },
    loadNextRoom: function( newRoomID ) 
    {
      var dir = ( ( newRoomID - this.currentRoom ) > 0 ? 1 : -1 ); //e.g. Room 2 to 3 => forward.
      this.unloadRoom( newRoomID - 2*dir ); //In room 3, unload room 3-2=1 (forward) or 3+2=5 (backward) via dir var.
      this.loadRoom( newRoomID ); //Else we never load the first room!
      this.loadRoom( newRoomID + dir );
    },
    setRoomData: function( parsedJSON ) 
    {
        this.rooms = parsedJSON;
        console.log( "Rooms: " + this.rooms );
    },
    finishInit: function( self )
    {
      this.el.addEventListener( 'door_opened', function(doorID) { self.loadNextRoom(doorID) } );
      this.currentRoom = 0;
      const FIRST_ROOM_ID = 1;
      this.loadNextRoom( FIRST_ROOM_ID );
    },
    ajaxRequest: function( componentSelf, xhr )
    {
      if (xhr.readyState === XMLHttpRequest.DONE) 
      {
        if (xhr.status === 200) 
        {
          var jsonObj = JSON.parse( xhr.responseText );
          componentSelf.setRoomData( jsonObj );
          componentSelf.finishInit( componentSelf );
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
      this.loadJSON( this, this.data.roomDataPath );      
    }
  }
);
