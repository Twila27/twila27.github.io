AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self ) {
    var manager = self.el.sceneEl.components.samsara_global;
    var inactiveCameraEl = manager.getInactiveAvatarEl();
    inactiveCameraEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
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
    const var HEIGHT_OFFSET_FROM_CAMERA = 2;
    this.el.setAttribute( 'position', { x:newPosition.x, y:newPosition.y + HEIGHT_OFFSET_FROM_CAMERA, z:newPosition.z } );
  }
} );
