AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self ) {
    var manager = self.el.sceneEl.components.samsara_global;
    var oldActiveCameraEl = manager.getActiveAvatarEl();
    var newActiveCameraEl = manager.getInactiveAvatarEl();
    newActiveCameraEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
    
    //Now also move the a-cursor over.
    var cursorEl = oldActiveCameraEl.querySelector('#cursor');
    //var eventlessClone = cursorEl.cloneNode(true);
    //cursorEl.removeAttribute('cursor-listener'); //To ensure it does not try anything funny.
    oldActiveCameraEl.removeChild(cursorEl);
    newActiveCameraEl.appendChild(cursorEl);
  },
  schema: {
    isKeysWorld : { type : 'boolean' } //Else assume it's the other world.
  },
  init: function() { 
    var self = this;
    this.el.addEventListener( 'click', function() { self.swapWorlds( self ); } );
    
    if ( this.data.isKeysWorld )
      this.followedAvatar = this.el.sceneEl.querySelector('#keysWorldCamera');
    else //Assumption it's the other world's swap button.
      this.followedAvatar = this.el.sceneEl.querySelector('#foesWorldCamera');
  },
  tick: function() {
    var newPosition = this.followedAvatar.getAttribute( 'position' ); //Can't store reference to array, only object (itself a ref).
    const HEIGHT_OFFSET_FROM_CAMERA = 2;
    this.el.setAttribute( 'position', { x:newPosition.x, y:newPosition.y + HEIGHT_OFFSET_FROM_CAMERA, z:newPosition.z } );
  }
} );
