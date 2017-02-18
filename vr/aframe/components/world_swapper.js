AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self ) {
    var manager = self.el.sceneEl.components.samsara_global;
    var oldActiveCameraEl = manager.getActiveAvatarEl();
    var newActiveCameraEl = manager.getInactiveAvatarEl();
    newActiveCameraEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
    
    //Now also move the a-cursor over.
    var cursorEl = document.querySelector('#cursor');
    oldActiveCameraEl.removeChild(cursorEl);
    
    if ( oldActiveCameraEl.id === 'keysWorldCamera' )
      cursorEl.setAttribute( 'raycaster', 'objects', '.worldSwap, .waypoint, .clickableForDebug, .floor' );
    else if ( oldActiveCameraEl.id === 'foesWorldCamera' )
      cursorEl.setAttribute( 'raycaster', 'objects', '.worldSwap, .waypoint, .clickableForDebug' ); //Can't add to floor.   
    
    newActiveCameraEl.appendChild(cursorEl);
  },
  schema: {
    isKeysWorld : { type : 'boolean' } //Else assume it's the other world.
  },
  init: function() { 
    var _self = this;
    this.el.addEventListener( 'click', function() { _self.swapWorlds( _self ); } );
    
    if ( this.data.isKeysWorld )
      this.followedAvatar = document.querySelector('#keysWorldCamera');
    else //Assumption it's the other world's swap button.
      this.followedAvatar = document.querySelector('#foesWorldCamera');
  },
  tick: function() {
    var newPosition = this.followedAvatar.getAttribute( 'position' ); //Can't store reference to array, only object (itself a ref).
    const HEIGHT_OFFSET_FROM_CAMERA = 2;
    this.el.setAttribute( 'position', { x:newPosition.x, y:newPosition.y + HEIGHT_OFFSET_FROM_CAMERA, z:newPosition.z } );
  }
} );
