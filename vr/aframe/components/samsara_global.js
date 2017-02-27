AFRAME.registerComponent( 'samsara_global', {
  getFoesWorldOrigin: function() {
    return this.foesWorldOrigin;
  },
  getKeysWorldOrigin: function() {
    return this.keysWorldOrigin;
  },
  areAllSpawnersClear: function() {
    return ( this.numSpawnersInRoom == 0 );
  },
  dropBarFillups: function( healDelta ) {
    this.keysWorldSwapButtonEl.addToSwapBar( healDelta );
    this.foesWorldSwapButtonEl.addToSwapBar( healDelta );
  },
  setNumSpawnersInRoom: function(newVal) {
    this.numSpawnersInRoom = newVal;
  },
  incrementNumSpawnersInRoom: function() { //Called in room_loader.addSpecialConfiguration().
    ++this.numSpawnersInRoom;
  },
  decrementNumSpawnersInRoom: function() { //Called in spawns-foes on all foes popped.
    if ( ( this.numSpawnersInRoom - 1 ) >= 0 )
    {
      this.dropBarFillups( this.data.spawnerHealDropAmount );
      --this.numSpawnersInRoom;
    }
    
    if ( this.numSpawnersInRoom == 0 )
      this.el.emit( 'room-cleared' ); //No more to spawn, show door node out.
  },
  setNumFoesInRoom: function(newVal) {
    this.numFoesInRoom = newVal;
  },
  incrementNumFoesInRoom: function() { //Called in spawns-foes on foe spawn.
    ++this.numFoesInRoom;
  },
  decrementNumFoesInRoom: function() { //Called in spawns-foes on foe popped.
    if ( ( this.numFoesInRoom - 1 ) >= 0 )
    {
      this.dropBarFillups( this.foeHealDropAmount );
      --this.numFoesInRoom;
    }
    
    if ( this.numFoesInRoom == 0 )
      this.el.emit( 'room-emptied' ); //May still have more to spawn, but one wave down.
  },
  playSound: function(soundName) {
    var found = this.sounds[soundName];
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
      var soundComponent = this.el.components[componentName];
      if ( soundComponent !== undefined )
        soundComponent.playSound();
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
    
    waypointCooledOff : { type : 'audio', default : 'assets/audio/MenuAccept.wav' }, //Temporary until I can fix listener-duping.
    waypointCreated : { type : 'audio', default : 'assets/audio/PlayerWalk1.wav' }, //For now, single out in playSound by name and swap values.
      //Multiple for this, make parse function to send in for this and similar below comments.
    nodePopped : { type : 'audio', default : 'assets/audio/NodeDeath1.wav' },
      //I want to parse multiple for this.
    foePopped : { type : 'audio', default : 'assets/audio/LaughingDeath.wav' },
    foeSpawned : { type : 'audio', default : 'assets/audio/Amalgamate.wav' }, 
    doorNodeAppeared : { type : 'audio', default : 'assets/audio/DreamOpened.wav' },
    doorOpen: { type : 'audio', default : 'assets/audio/Тема для меню. (promodj.com).mp3' }, //Basically using this to kick off background music!
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
   this.el.addEventListener( 'door_opened', function() { self.isKeysWorldDecaying = true; } );
   
   var sceneEl = this.el.sceneEl;
   this.keysCameraEl = sceneEl.querySelector('#keysWorldCamera');
   this.foesCameraEl = sceneEl.querySelector('#foesWorldCamera');
   this.keysWorldSwapButtonEl = sceneEl.querySelector( '#keysWorldSwapButton' );
   this.foesWorldSwapButtonEl = sceneEl.querySelector( '#foesWorldSwapButton' );
    
   this.numWaypoints = 0;
   this.numFoesInRoom = 0;
   this.numSpawnersInRoom = 0;
    
   this.foesWorldOrigin = { x:this.data.worldOffsetFromOrigin, y:0, z:0 };
   this.keysWorldOrigin = { x:this.data.worldOffsetFromOrigin*-1, y:0, z:0 };
    
   this.sounds = {};
   this.sounds.waypointCooledOff = this.data.waypointCooledOff;
   this.sounds.waypointCreated = this.data.waypointCreated;
   this.sounds.nodePopped = this.data.nodePopped;
   this.sounds.foePopped = this.data.foePopped;
   this.sounds.foeSpawned = this.data.foeSpawned;
   this.sounds.doorNodeAppeared = this.data.doorNodeAppeared;
   this.sounds.doorOpen = this.data.doorOpen;
   
   this.sounds.swapBonk = this.data.swapBonk;
   this.sounds.swapFilled = this.data.swapFilled;
   this.sounds.swapFilling = this.data.swapFilling;
   this.sounds.swapDecaying = this.data.swapDecaying;
   this.sounds.swapActivating = this.data.swapActivating;
   
   var soundArray = this.sounds;
   for ( const soundName in soundArray )
   {
     var componentName = this.getSoundAttributeNameForSchemaProperty(soundName);
     this.el.setAttribute( componentName, 'src', this.sounds[soundName] );
   }    
  },
  tick: function( time, timeDeltaMilliseconds )
  {
     if ( this.isKeysWorldDecaying )
     {
       var hitZero = this.keysWorldSwapButtonEl.removeFromSwapBar( timeDeltaMilliseconds ); //Auto-kicks to foes world at zero.
       this.foesWorldSwapButtonEl.removeFromSwapBar( timeDeltaMilliseconds ); //To keep sync'd.
       
       if ( hitZero )
         this.isKeysWorldDecaying = false;
     }
  }
} );
