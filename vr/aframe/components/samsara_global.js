AFRAME.registerComponent( 'samsara_global', {
  areAllFoesPopped: function() {
    return ( this.numFoesInRoom == 0 );
  },
  setNumFoesInRoom: function(newVal) {
    this.numFoesInRoom = newVal;
  },
  incrementNumFoesInRoom: function() {
    ++this.numFoesInRoom;
  },
  decrementNumFoesInRoom: function() {
    if ( ( this.numFoesInRoom - 1 ) >= 0 )
      --this.numFoesInRoom;
    
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
        var sceneEl = this.el.sceneEl;
    
        var keysCameraEl = sceneEl.querySelector('#keysWorldCamera');
        if ( keysCameraEl.components.camera.data.active )
          return keysCameraEl;

        var foesCameraEl = sceneEl.querySelector('#foesWorldCamera');
        if ( foesCameraEl.components.camera.data.active )
          return foesCameraEl;

        return undefined;
  },
  getInactiveAvatarEl: function() {
        var sceneEl = this.el.sceneEl;
    
        var keysCameraEl = sceneEl.querySelector('#keysWorldCamera');
        if ( !keysCameraEl.components.camera.data.active )
          return keysCameraEl;

        var foesCameraEl = sceneEl.querySelector('#foesWorldCamera');
        if ( !foesCameraEl.components.camera.data.active )
          return foesCameraEl;

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
    waypointCooledOff : { type : 'audio' },
    waypointCreated : { type : 'audio' },
    nodePopped : { type : 'audio' },
    foePopped : { type : 'audio' }
  },
  getSoundAttributeNameForSchemaProperty : function(schemaProperty) {
    return 'sound__' + schemaProperty;
    //path will be accessible via (that component).id after its setAttribute.
  },
  init: function() {
   this.numWaypoints = 0;
   this.numFoesInRoom = 0;
   
   this.sounds = {};
   this.sounds.waypointCooledOff = this.data.waypointCooledOff;
   this.sounds.waypointCreated = this.data.waypointCreated;
   this.sounds.nodePopped = this.data.nodePopped;
   this.sounds.foePopped = this.data.foePopped;
    
   var soundArray = this.sounds;
   for ( const soundName in soundArray )
   {
     var componentName = this.getSoundAttributeNameForSchemaProperty(soundName);
     this.el.setAttribute( componentName, 'src', this.sounds[soundName] );
   }    
  }
} );
