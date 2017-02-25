AFRAME.registerComponent( 'samsara_global', {
  playSound: function(soundName) {
    var found = this.sounds[soundName];
    if ( found === undefined )
    {
      console.log("samsara_global could not find sound named " + soundName); 
      return;
    }
    else if ( soundPath === "" )
    {
      console.log("samsara_global found sound entry, but no schema src!");
      return; 
    }
    else //Means a value was supplied in the schema!
    {
      var componentName = this.getSoundAttributeNameForPath(soundPath);
      console.log("Given " + soundPath + ", going to play component " + componentName);
      this.el.components[componentName].playSound();
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
  schema: {
    waypointCooledOff : { type : 'audio' },
    waypointCreated : { type : 'audio' },
    nodePopped : { type : 'audio' },
    foePopped : { type : 'audio' }
  },
  getSoundAttributeNameForPath : function(path) {
    return 'sound__' + path;
    //path will be accessible via (that component).id after its setAttribute.
  },
  init: function() {
   this.numWaypoints = 0;
   
   this.sounds = {};
   this.sounds.waypointCooledOff = this.data.waypointCooledOff;
   this.sounds.waypointCreated = this.data.waypointCreated;
   this.sounds.nodePopped = this.data.nodePopped;
   this.sounds.foePopped = this.data.foePopped;
  }
} );
