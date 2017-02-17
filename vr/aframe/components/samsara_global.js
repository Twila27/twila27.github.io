AFRAME.registerComponent( 'samsara_global', {
  getActiveAvatarEl: function() {
        var keysAvatarEl = document.querySelector('#keysWorldAvatar');
        var keysCameraEl = document.querySelector('#keysWorldCamera');
        if ( keysCameraEl.components.camera.data.active )
          return keysAvatarEl;

        var foesAvatarEl = document.querySelector('#foesWorldAvatar');
        var foesCameraEl = document.querySelector('#foesWorldCamera');
        if ( foesAvatarEl.components.camera.data.active )
          return foesAvatarEl;

        return undefined;
  },
  getInactiveAvatarEl: function() {
        var keysAvatarEl = document.querySelector('#keysWorldAvatar');
        var keysCameraEl = document.querySelector('#keysWorldCamera');
        if ( !keysCameraEl.components.camera.data.active )
          return keysAvatarEl;

        var foesAvatarEl = document.querySelector('#foesWorldAvatar');
        var foesCameraEl = document.querySelector('#foesWorldCamera');
        if ( !foesCameraEl.components.camera.data.active )
          return foesAvatarEl;

        return undefined;
  }
} );
