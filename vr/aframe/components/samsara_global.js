AFRAME.registerComponent( 'samsara_global', {
  getFoesWorldOrigin: function() {
    return this.foesWorldOrigin;
  },
  getKeysWorldOrigin: function() {
    return this.keysWorldOrigin;
  },
  areAllSpawnersClear: function() {
    return ( this.roomSpawnerCounts[ this.activeRoom ] == 0 );
  },
  dropBarFillups: function( healDelta ) {
    this.keysWorldSwapButtonEl.components['world-swapper'].addToSwapBar( healDelta );
    this.foesWorldSwapButtonEl.components['world-swapper'].addToSwapBar( healDelta );
  },
  incrementNumSpawnersInRoom: function( roomID ) { //Called in room_loader.addSpecialConfiguration().
    var spawnerCountForRoom = this.roomSpawnerCounts[ roomID ];
    if ( spawnerCountForRoom === undefined )
      this.roomSpawnerCounts[ roomID ] = 1;
    else
      ++this.roomSpawnerCounts[ roomID ];
  },
  decrementNumSpawnersInRoom: function( roomID ) { //Called in spawns-foes on all foes popped.
    if ( ( this.roomSpawnerCounts[ roomID ] - 1 ) >= 0 )
    {
      this.dropBarFillups( this.data.spawnerHealDropAmount );
      --this.roomSpawnerCounts[ roomID ];
    }
    
    //Can't just emit room-cleared, being on the sceneEl.
    var isRoomClear = ( this.roomSpawnerCounts[ roomID ] == 0 ); //No more to spawn, show door node out.
    if ( isRoomClear )
      console.log( "CLEARED ROOM " + roomID )
    return isRoomClear;
  },
  incrementNumFoesInRoom: function( roomID ) { //Called in spawns-foes on foe spawn.
    ++this.numFoesInActiveRoom;
  },
  decrementNumFoesInRoom: function( roomID ) { //Called in spawns-foes on foe popped.
    if ( ( this.numFoesInActiveRoom - 1 ) >= 0 )
    {
      this.dropBarFillups( this.data.foeHealDropAmount );
      --this.numFoesInActiveRoom;
    }
    
    //Can't just emit room-emptied, being on the sceneEl.
    return ( this.numFoesInActiveRoom == 0 ); //May still have more to spawn, but one wave down.
  },
  createNewSpeaker: function( soundName, componentName, soundComponent, position ) {
    var speakersElArray = this.speakersEl.speakers;
    var speakersPool = this.el.sceneEl.components.pool__speakers;
    if ( ( speakersElArray.length + 1 ) > speakersPool.data.size )
    {
      var oldestSpeakerEl = speakersElArray.shift(); //effectively pop_front().
      oldestSpeakerEl.stopSound();
      speakersPool.returnEntity(oldestSpeakerEl);
    }
    
    var newSpeakerEl = speakersPool.requestEntity();
    speakersElArray.push( newSpeakerEl );

    const SPEAKER_OFFSET_FROM_PLAYER = -1.6;
    var newSpeakerPositionY = position.y + SPEAKER_OFFSET_FROM_PLAYER; //to keep it out of their head.
    newSpeakerEl.setAttribute( 'position', { x:position.x, y:newSpeakerPositionY, z:position.z } );
    newSpeakerEl.setAttribute( componentName, soundComponent.data );
    var newSpeakerSoundComponent = newSpeakerEl.components[ componentName ];
    newSpeakerEl.stopSound = function() { newSpeakerSoundComponent.stopSound(); };
    return newSpeakerSoundComponent; //To be .playSound()'d.
  },
  playSound: function(soundName, position, volume = 1) {
    var found = this.speakersEl.sounds[soundName];
    if ( found === undefined )
    {
      console.log("samsara_global could not find sound named " + soundName); 
      return;
    }
    else if ( found === "" )
    {
      console.log("samsara_global found sound entry, but no schema src!");
      return; 
    }
    else //Means a value was supplied in the schema!
    {
      var componentName = this.getSoundAttributeNameForSchemaProperty(soundName);
      var soundComponent = this.speakersEl.components[componentName];
      if ( soundComponent !== undefined ) //Has a configuration for this sound.
      {        
        if ( position === undefined ) //Just play it in-ear, no new object.
        {    
          position = this.getActiveAvatarEl().components.position;
          this.speakersEl.setAttribute( 'position', position );
          soundComponent.volume = volume;
          soundComponent.playSound(); //On the global speaker moved to your avatarEl.
        }
        else
        {
          var speakerSoundComponent = this.createNewSpeaker( soundName, componentName, soundComponent, position );
          speakerSoundComponent.volume = volume;
          const MILLISECONDS_UNTIL_PLAY = 100; //Need to delay just enough to init the sound.
          setTimeout( function() { speakerSoundComponent.playSound(); }, MILLISECONDS_UNTIL_PLAY );
        }
        
      }
      else
        console.log("Undefined component in samsara_global.playSound!");
    }
  },
  getRandomColor: function() { //Concatenate 0 to F six times.
    var colorStr = '#';
    var letters = '0123456789ABCDEF';
    for ( var strIndex = 0; strIndex < 6; strIndex++ ) {
      var pickedLetterIndex = Math.floor( Math.random() * 16 );
      colorStr += letters[ pickedLetterIndex ];
    }
    return colorStr; 
  },
  getActiveAvatarEl: function() {    
        if ( this.keysCameraEl.components.camera.data.active )
          return this.keysCameraEl;

        if ( this.foesCameraEl.components.camera.data.active )
          return this.foesCameraEl;

        return undefined;
  },
  getInactiveAvatarEl: function() {
        if ( !this.keysCameraEl.components.camera.data.active )
          return this.keysCameraEl;

        if ( !this.foesCameraEl.components.camera.data.active )
          return this.foesCameraEl;

        return undefined;
  },
  incrementNumWaypoints: function() { 
    ++this.numWaypoints; 
    console.log("Added waypoint #" + this.numWaypoints + "." );
  },
  getCurrentNumWaypoints: function() {
    return this.numWaypoints;
  },
  schema: {
    worldOffsetFromOrigin: { default : 100 },
    spawnerHealDropAmount: { default : 25 },
    foeHealDropAmount: { default : 25 },
    
    waypointCooledOff : { type : 'audio', default : '' }, //Temporary until I can fix listener-duping. prev default: assets/audio/MenuAccept.wav
    waypointCreated : { type : 'audio', default : 'assets/audio/PlayerWalk1.wav' }, //For now, single out in playSound by name and swap values.
      //Multiple for this, make parse function to send in for this and similar below comments.
    nodePopped : { type : 'audio', default : 'assets/audio/NodeDeath1.wav' },
      //I want to parse multiple for this.
    foePopped : { type : 'audio', default : 'assets/audio/LaughingDeath.wav' },
    foeSpawned : { type : 'audio', default : 'assets/audio/Amalgamate.wav' }, 
    doorNodeAppeared : { type : 'audio', default : 'assets/audio/DreamOpened.wav' },
    doorOpen: { type : 'audio', default : 'assets/audio/DreamOpened.wav' }, //Basically using this to kick off background music!
      //I want to parse multiple for this, to have multiple BGM.
    
    swapBonk : { type : 'audio', default : 'assets/audio/SwapBonk.wav' },
    swapFilled : { type : 'audio', default : 'assets/audio/UI2cancel.ogg' },
    swapFilling : { type : 'audio', default : 'assets/audio/UI1okay.ogg' },
    swapDecaying : { type : 'audio', default : 'assets/audio/MenuDecline.wav' },
    swapActivating : { type : 'audio', default : 'assets/audio/interaction_magic_spell_02.wav' } //AKA swapDecayed.    
  },
  getSoundAttributeNameForSchemaProperty : function(schemaProperty) {
    return 'sound__' + schemaProperty;
    //path will be accessible via (that component).id after its setAttribute.
  },
  init: function() {
   var self = this;
   this.el.addEventListener( 'door_opened', function(event) { 
     self.numFoesInActiveRoom = 0; //Resetting.
     self.activeRoom = event.detail.doorRoomID; //Advancing.
     if ( event.detail.isKeysWorld ) 
       self.isKeysWorldDecaying = true; 
   });

   var sceneEl = this.el.sceneEl;
   this.keysCameraEl = sceneEl.querySelector('#keysWorldCamera');
   this.foesCameraEl = sceneEl.querySelector('#foesWorldCamera');
   this.keysWorldSwapButtonEl = sceneEl.querySelector( '#keysWorldSwapButton' );
   this.foesWorldSwapButtonEl = sceneEl.querySelector( '#foesWorldSwapButton' );
   this.speakersEl = sceneEl.querySelector('#speaker');

   this.numWaypoints = 0;
   this.numFoesInActiveRoom = 0;
   this.activeRoom = 0;
   this.roomSpawnerCounts = {};
    
   this.foesWorldOrigin = { x:this.data.worldOffsetFromOrigin, y:0, z:0 };
   this.keysWorldOrigin = { x:this.data.worldOffsetFromOrigin*-1, y:0, z:0 };
    
   this.speakersEl.sounds = {};
   this.speakersEl.speakers = []; //Compare to waypointsArray in waypoints.js.
   this.speakersEl.sounds.waypointCooledOff = this.data.waypointCooledOff;
   this.speakersEl.sounds.waypointCreated = this.data.waypointCreated;
   this.speakersEl.sounds.nodePopped = this.data.nodePopped;
   this.speakersEl.sounds.foePopped = this.data.foePopped;
   this.speakersEl.sounds.foeSpawned = this.data.foeSpawned;
   this.speakersEl.sounds.doorNodeAppeared = this.data.doorNodeAppeared;
   this.speakersEl.sounds.doorOpen = this.data.doorOpen;
   
   this.speakersEl.sounds.swapBonk = this.data.swapBonk;
   this.speakersEl.sounds.swapFilled = this.data.swapFilled;
   this.speakersEl.sounds.swapFilling = this.data.swapFilling;
   this.speakersEl.sounds.swapDecaying = this.data.swapDecaying;
   this.speakersEl.sounds.swapActivating = this.data.swapActivating;

   var soundArray = this.speakersEl.sounds;
   for ( const soundName in soundArray ) //'this' ref has different scope in here?
   {
     var componentName = self.getSoundAttributeNameForSchemaProperty(soundName);
     self.speakersEl.setAttribute( componentName, {
       src: soundArray[soundName],
       poolSize: 3,
       volume: 1
     });
     self.speakersEl.components[ componentName ].multiple = false;
   }    
  },
  tick: function( time, timeDeltaMilliseconds )
  {
     if ( this.isKeysWorldDecaying )
     {
       const MAX_DELTA_MILLISECONDS = 1000.0; //Don't permit over 1 second of decay per tick.
       var decayDelta = ( timeDeltaMilliseconds < MAX_DELTA_MILLISECONDS ) ? timeDeltaMilliseconds : MAX_DELTA_MILLISECONDS; //Framerate limiter.
       var hitZero = this.keysWorldSwapButtonEl.components['world-swapper'].removeFromSwapBar( timeDeltaMilliseconds ); //Auto-kicks to foes world at zero.
       this.foesWorldSwapButtonEl.components['world-swapper'].removeFromSwapBar( timeDeltaMilliseconds ); //To keep sync'd.
       
       if ( hitZero )
         this.isKeysWorldDecaying = false;
     }
  }
} );
