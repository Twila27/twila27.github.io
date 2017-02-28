AFRAME.registerComponent( 'room_loader', //If we use hyphens, can't access as "node.room-loader."
  {
    schema: 
    {
      roomDataPath : { default : '' },
      doorNodeMixin : { default : 'combatNodePrefabMesh combatNodePrefabMaterial' },
      doorNodeGazeTimeMilliseconds: { default : 0.0 },
      doorNodeAppearedSoundName : { type : 'string', default : 'doorNodeAppeared' },
      doorOpenSoundName : { type : 'string', default : 'doorOpen' }
    },
    doesObjHaveModel: function( jsonObjVal )
    {
      return jsonObjVal !== 'text'; //Rest have models.
    },
    createNonModelObj: function( jsonData, foesWorldEl, keysWorldEl )
    {
      switch (jsonData.obj)
      {
          case 'text' :
            foesWorldEl.setAttribute( 'text', {
              value: jsonData.foesVal,
              color: "red",
              width: 100,
              align: 'center'
            });
            keysWorldEl.setAttribute( 'text', {
              value: jsonData.keysVal,
              color: "green",
              width: 100,
              align: 'center'
            });
             break;
          default : break; //Do-nothing creates-nothing.
      }
    },
    getSpawnEventForSpawnerType: function( jsonVal ) 
    {
      switch(jsonVal) 
      {
        case 'bee' : 
          return 'mouseenter';
        case 'debug' : 
        case 'click' : 
        case 'clickable' : 
          return 'click';
        default : 
          return 'global_spawn';    
      }
    },
    getFoePrefabNameFromJSON: function( jsonVal ) //In future, expose via schema taking object!
    {
      switch(jsonVal)
      {
        case 'spider' : return 'spiderFoePrefab';
        default : return 'gazetimerFoePrefab';
      }
    },
    addSpecialConfiguration: function( foesWorldEl, keysWorldEl, elData, newRoomID )
    {
      //This is where we'll attach other .js components if we match elData.obj's string value.
      var name = elData.obj.toLowerCase();
      switch (name) {
        case 'exit':
        case 'doubledoors':
        case 'door':
          var properties = {
            nodeMixin: this.data.doorNodeMixin,
            nodeGazeTimeMilliseconds: this.data.doorNodeGazeTimeMilliseconds,
            doorNodeAppearedSoundName: this.data.doorNodeAppearedSoundName,
            doorOpenSoundName: this.data.doorOpenSoundName,
            doorRoomID: newRoomID,
            showNodeImmediately: !this.hasSpawnedDoor //Ensures we only do this for first room.
          };
          properties.isKeysWorld = false;
          foesWorldEl.setAttribute( 'door_opener', properties );
          properties.isKeysWorld = true;
          keysWorldEl.setAttribute( 'door_opener', properties );
          break;
        case 'spawner': //A lot of "if JSON has it, defer to that, else use member method's mapped defaults."
          var properties = {
            numToSpawn: ( elData.numSpawns === undefined ) ? 1 : elData.numSpawns, //Per trip through the room, since room_loader recreates it.
            spawnEvent: ( elData.spawnEvent === undefined ) ? this.getSpawnEventForSpawnerType( elData.spawnType ) : elData.spawnEvent,
            roomID : newRoomID,
          };

          properties.mixin = this.getFoePrefabNameFromJSON( elData.spawnType ) + "_foesWorld"; //What to spawn.
          properties.isKeysWorld = false;
          foesWorldEl.setAttribute( 'spawns-foes', properties );
          properties.mixin = this.getFoePrefabNameFromJSON( elData.spawnType ) + "_keysWorld"; //What to spawn.
          properties.isKeysWorld = true;
          keysWorldEl.setAttribute( 'spawns-foes', properties );

          if ( elData.maxFoeSpawnCoords !== undefined )
          {
            foesWorldEl.setAttribute( 'spawns-foes', 'maxFoeSpawnCoords', elData.maxFoeSpawnCoords );
            keysWorldEl.setAttribute( 'spawns-foes', 'maxFoeSpawnCoords', elData.maxFoeSpawnCoords );
          }
          if ( elData.maxNodeSpawnCoords !== undefined )
          {
            foesWorldEl.setAttribute( 'spawns-foes', 'maxNodeSpawnCoords', elData.maxNodeSpawnCoords );
            keysWorldEl.setAttribute( 'spawns-foes', 'maxNodeSpawnCoords', elData.maxNodeSpawnCoords );
          }
          this.el.sceneEl.components.samsara_global.incrementNumSpawnersInRoom( newRoomID );
          
          if ( properties.spawnEvent == 'global_spawn' )
          {
            var roomImmediateSpawnerList = this.spawnsOnEntry[ newRoomID ];
            if ( this.spawnsOnEntry[ newRoomID ] === undefined )
              this.spawnsOnEntry[ newRoomID ] = [];
            this.spawnsOnEntry[ newRoomID ].push( foesWorldEl );
            this.spawnsOnEntry[ newRoomID ].push( keysWorldEl );
          }
          break;
        case 'end':
        case 'endgate':
          foesWorldEl.setAttribute( 'endgate', {} ); //Has an if-nil-return check, so we have to send {}.
          keysWorldEl.setAttribute( 'endgate', {} );
          break;
        case 'floor':
          foesWorldEl.className = 'floor';
          keysWorldEl.className = 'floor';
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
    parseRotation: function(str, delimiter = ' ') //Expects "x y z"
    {        
      return this.parsePosition(str, delimiter);
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
    unloadRoom: function( oldRoomID ) 
    {
      if ( ( oldRoomID < 1 ) || ( oldRoomID > this.rooms.numRooms ) )
        return;
      
      var found = undefined;
      for ( i = 0; i < this.loadedRooms.length; i++ )
        if ( this.loadedRooms[i] == oldRoomID )
          found = i;
      
      if ( found !== undefined )
        this.loadedRooms.splice(found, 1);
      else
        return;
      
      console.log("UNLOADROOM " + oldRoomID );
      console.log("UNIMPLEMENTED!" );
    },
    getKeysWorldPosition: function( jsonPosition ) 
    {
      var keysWorldOrigin = this.el.sceneEl.components.samsara_global.getKeysWorldOrigin();
      var keysPos = {
        x: jsonPosition.x + keysWorldOrigin.x,
        y: jsonPosition.y + keysWorldOrigin.y,
        z: jsonPosition.z + keysWorldOrigin.z
      };
      return keysPos;
    },
    getFoesWorldPosition: function( jsonPosition ) 
    {
      var foesWorldOrigin = this.el.sceneEl.components.samsara_global.getFoesWorldOrigin();
      var foesPos = {
        x: jsonPosition.x + foesWorldOrigin.x,
        y: jsonPosition.y + foesWorldOrigin.y,
        z: jsonPosition.z + foesWorldOrigin.z
      };
      return foesPos;
    },
    runSpawnsOnEntry: function( self, isKeysWorld, newRoomID ) //Gets called by both component + handler, hence self.
    {
      var immediateRoomSpawns = self.spawnsOnEntry[ newRoomID ];
      if ( immediateRoomSpawns === undefined )
        return; //None to spawn.
      
      for ( const key in immediateRoomSpawns )
      {
        var spawner = immediateRoomSpawns[key].components['spawns-foes'];
        if ( spawner.isKeysWorld() === isKeysWorld )
        {
          spawner.spawn(); //Skip other world's spawns until its door opens.
          delete immediateRoomSpawns[key];
        }
      }
      
    },
    loadRoom: function( newRoomID ) 
    {
      if ( ( newRoomID < 1 ) || ( newRoomID > this.rooms.numRooms ) )
        return;
      
      for ( i = 0; i < this.loadedRooms.length; i++ )
        if ( this.loadedRooms[i] == newRoomID )
        {
          this.runSpawnsOnEntry( this, true, newRoomID );
          return; //So when room i+1 ahead of you already is loaded as room i, entry spawns go.
        }
      
      console.log("LOADROOM " + newRoomID );   
      var roomName = this.getRoomNameFromID( newRoomID );
      var roomOrigin = this.parsePosition( this.rooms.origins[roomName] );
      var roomObjects = this.rooms.meshes[roomName];
      
      this.hasSpawnedDoor = false;
      for ( i = 0; i < roomObjects.length; i++ )
      {
        const elData = roomObjects[i];
        var dataPosition = this.parsePosition( elData.position );
        dataPosition.x += roomOrigin.x;
        dataPosition.y += roomOrigin.y;
        dataPosition.z += roomOrigin.z;        
        var keysWorldPosition = this.getKeysWorldPosition( dataPosition );
        var foesWorldPosition = this.getFoesWorldPosition( dataPosition );
        var objModel = undefined;
        if ( elData.obj !== undefined && this.doesObjHaveModel( elData.obj ) )
        {
          objModel = { 
            obj: this.getMeshNameFromJSON( elData.obj ), 
            mtl: this.getMaterialNameFromJSON( elData.obj )
          };
        }
        
        var foesWorldEl = document.createElement('a-entity');
        var keysWorldEl = document.createElement('a-entity');
        
        foesWorldEl.setAttribute( 'position', foesWorldPosition );
        keysWorldEl.setAttribute( 'position', keysWorldPosition );
        if ( elData.rotation !== undefined )
        {
          var dataRotation = this.parseRotation( elData.rotation );
          foesWorldEl.setAttribute( 'rotation', dataRotation );
          keysWorldEl.setAttribute( 'rotation', dataRotation );          
        }
        
        if ( objModel !== undefined ) 
        {
          foesWorldEl.setAttribute( 'obj-model', objModel );
          keysWorldEl.setAttribute( 'obj-model', objModel );
        }
        else //Can apply below format to create different meshes, etc. b/t the worlds.
        {
          this.createNonModelObj( elData, foesWorldEl, keysWorldEl );
        }
        
        if ( elData.obj === "floor" )
        {
          foesWorldEl.id = "foesWorldFloor";
          keysWorldEl.id = "keysWorldFloor";
        }

        foesWorldEl.setAttribute( 'scale', '.25 .25 .25' );
        keysWorldEl.setAttribute( 'scale', '.25 .25 .25' );

        this.addSpecialConfiguration( foesWorldEl, keysWorldEl, elData, newRoomID );
        
        if ( elData.obj === "doubledoors" )
          this.hasSpawnedDoor = true;

        this.el.sceneEl.appendChild( foesWorldEl );
        this.el.sceneEl.appendChild( keysWorldEl );
      }    
      
      this.loadedRooms.push( newRoomID );
    },
    getLastMovementDir: function() {
      return this.lastDir;
    },
    getMovementDir: function( currentRoomID )
    {
      var displacement = currentRoomID - this.previousRoomID;
      var movementDir;
      
      if ( displacement > 0 )
        movementDir = 1; //e.g. Room 2 to 3 => 3-2, adding +1 to IDs to load forwards.
      else if ( displacement < 0 )
        movementDir = -1; //e.g. Room 3 to 2 => 2-3, adding -1 to IDs to load backwards.
      else
        movementDir = ( this.lastDir * -1 ); //Flip as we enter previousRoom's door.
      
      this.lastDir = movementDir;     
      return movementDir;
    },
    loadNextRoom: function( newRoomID ) 
    {      
      var dir = this.getMovementDir( newRoomID );
      this.unloadRoom( newRoomID - 2*dir ); //In room 3, unload room 3-2=1 (forward) or 3+2=5 (backward) via dir var.
      this.loadRoom( newRoomID ); //Else we never load the first room!
      this.loadRoom( newRoomID + dir );
      console.log( "Loaded Rooms:" );
      console.log( this.loadedRooms );
    },
    setRoomData: function( parsedJSON ) 
    {
        this.rooms = parsedJSON;
        console.log( "Rooms: " ); 
        console.log( this.rooms );
    },
    finishInit: function( self )
    {      
      this.previousRoomID = 0; //Makes getMovementDir() move forward initially.
      const FIRST_ROOM_ID = 1;
      this.loadNextRoom( FIRST_ROOM_ID );
      
      this.el.addEventListener( 'door_opened', function(event) { 
        var currentRoomID = event.detail.doorRoomID;
        if ( event.detail.isKeysWorld )
        {
          var dir = self.getMovementDir( currentRoomID ); //Leaving this room.
          var newRoomID = currentRoomID + dir; //Entering this room.
          self.loadNextRoom( newRoomID ); 
          self.previousRoomID = currentRoomID;
        }
        else
        {
          var dir = self.getLastMovementDir(); //Following isKeysWorld ALWAYS.
          var newRoomID = currentRoomID + dir; //Entering this room.
          self.runSpawnsOnEntry( self, false, newRoomID );
        }
      });
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
      this.loadedRooms = [];
      this.spawnsOnEntry = {};
      this.loadJSON( this, this.data.roomDataPath );      
    }
  }
);
