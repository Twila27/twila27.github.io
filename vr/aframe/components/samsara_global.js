AFRAME.registerComponent( 'samsara_global', {
  getActiveAvatarEl: function() {
        var keysCameraEl = document.querySelector('#keysWorldCamera');
        if ( keysCameraEl.components.camera.data.active )
          return keysCameraEl;

        var foesCameraEl = document.querySelector('#foesWorldCamera');
        if ( foesCameraEl.components.camera.data.active )
          return foesCameraEl;

        return undefined;
  },
  getInactiveAvatarEl: function() {
        var keysCameraEl = document.querySelector('#keysWorldCamera');
        if ( !keysCameraEl.components.camera.data.active )
          return keysCameraEl;

        var foesCameraEl = document.querySelector('#foesWorldCamera');
        if ( !foesCameraEl.components.camera.data.active )
          return foesCameraEl;

        return undefined;
  }
} );
