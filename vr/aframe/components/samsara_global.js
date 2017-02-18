AFRAME.registerComponent( 'samsara_global', {
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
  }
} );
