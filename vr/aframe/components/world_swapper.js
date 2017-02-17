AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self ) {
    var manager = self.el.sceneEl.components.samsara_global;
    var inactiveAvatarEl = manager.getInactiveAvatarEl();
    inactiveAvatarEl;
    inactiveAvatarEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
  },
  init: function() { 
    var _self = this;
    this.el.addEventListener( 'click', function() { _self.swapWorlds( _self ); } );
  }
} );
