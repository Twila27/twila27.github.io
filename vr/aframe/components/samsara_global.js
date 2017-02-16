AFRAME.registerComponent( 'samsara_global', {
  getActiveAvatarEl: function() {
        var keysAvatarEl = document.querySelector('#keysWorldAvatar');
        if ( keysAvatarEl.components.camera.data.active )
          return keysAvatarEl;

        var foesAvatarEl = document.querySelector('#foesWorldAvatar');
        if ( foesAvatarEl.components.camera.data.active )
          return foesAvatarEl;

        return undefined;
  },
  getInactiveAvatarEl: function() {
        var keysAvatarEl = document.querySelector('#keysWorldAvatar');
        if ( !keysAvatarEl.components.camera.data.active )
          return keysAvatarEl;

        var foesAvatarEl = document.querySelector('#foesWorldAvatar');
        if ( !foesAvatarEl.components.camera.data.active )
          return foesAvatarEl;

        return undefined;
  }
} );
