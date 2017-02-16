AFRAME.registerComponent( 'cursor-listener', {
  getActiveCameraEl: function() {
      var keysCameraEl = document.querySelector('#keysWorldCamera');
      if ( keysCameraEl.components.camera.data.active )
        return keysCameraEl;
      
      var foesCameraEl = document.querySelector('#foesWorldCamera');
      if ( foesCameraEl.components.camera.data.active )
        return foesCameraEl;
 
      return undefined;
  },
  movePlayerToLocation: function( worldSpaceLocation ) {
    var activeCameraEl = this.getActiveCameraEl();
    var cameraHeight = activeCameraEl.getAttribute( 'position' ).y;
    activeCameraEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:cameraHeight, z:worldSpaceLocation.z } );
  },
  createWaypoint: function( self, location ) {
    var newWaypointElement = self.el.sceneEl.components.pool__waypoints.requestEntity();
    newWaypointElement.setAttribute( 'position', location );
  },
  handleClick: function(ev, self) { 
    var hitObjectLocation = ev.detail.intersection.point;
    var hitObjectClass = ev.detail.intersection.object.el.className;

    if ( hitObjectClass === 'floor' )
    {
      this.createWaypoint( self, hitObjectLocation ); //Else assume it's an existing waypoint.
      this.movePlayerToLocation( hitObjectLocation );
    }
    
    if ( hitObjectClass !== 'clickableForDebug' )
    {
      this.movePlayerToLocation( hitObjectLocation );
    }
  },
  init: function() { 
    var _self = this; //Have to be sure to do this to self-ref the handleClick func below.
    this.el.addEventListener( 'click', function(event) { _self.handleClick(event, _self); } );
  }
} );

AFRAME.registerComponent( 'waypoint', {
  init: function() {
    this.el.setAttribute( 'class', 'waypoint' );
  }
} );
