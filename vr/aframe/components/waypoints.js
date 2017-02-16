AFRAME.registerComponent( 'cursor-listener', {
  getActiveAvatarEl: function( self ) { 
    return self.el.sceneEl.components.samsara_global.getActiveAvatarEl();
  }, 
  movePlayerToLocation: function( self, worldSpaceLocation ) {
    var activeAvatarEl = self.getActiveAvatarEl( self );
    var cameraHeight = activeAvatarEl.getAttribute( 'position' ).y;
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:cameraHeight, z:worldSpaceLocation.z } );
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
      self.createWaypoint( self, hitObjectLocation ); //Else assume it's an existing waypoint.
      self.movePlayerToLocation( self, hitObjectLocation );
    }
    else if ( hitObjectClass === 'waypoint'  )
    {
      self.movePlayerToLocation( hitObjectLocation );
    }
  },
  init: function() { 
    var _self = this; //Have to be sure to do this to self-ref the handleClick func below.
    this.el.addEventListener( 'click', function(event) { _self.handleClick(event, _self); } );
  }
} );
