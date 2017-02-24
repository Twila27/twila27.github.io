AFRAME.registerComponent( 'samsara_global', {
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
  handleClick: function(event, self) {
    //The reason we add this here, not on cursor-listener anymore:
    //When an entity element's reparented, its components get remade.
    //So tracking state there's pointless, and adding listeners seems to weirdly pile up more and more of them.
    
    var cursorEl = document.querySelector( '#cursor' ); //Instead, grab the cursor here, wherever it resides.
    cursorEl.handleClick( event, self ); //Passes self since we potentially ++numWaypoints.
  },
  init: function() {
   this.numWaypoints = 0;
   
   var self = this; //Because below listener's scope != this function's.
   this.el.addEventListener( 'click', function(event) { this.handleClick( event, self ); } );
  }
} );
