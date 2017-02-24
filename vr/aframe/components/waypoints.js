AFRAME.registerComponent( 'cursor-listener', {
  getActiveAvatarEl: function( self ) { 
    return self.el.sceneEl.components.samsara_global.getActiveAvatarEl();
  }, 
  movePlayerToLocation: function( self, worldSpaceLocation ) {
    var activeAvatarEl = self.getActiveAvatarEl( self );
    var avatarHeight = activeAvatarEl.getAttribute( 'position' ).y; //Preserving it, as worldSpaceLocation is at floor level.
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:avatarHeight, z:worldSpaceLocation.z } );
  },
  createWaypoint: function( self, location ) {
    var newWaypointElement = self.el.sceneEl.components.pool__waypoints.requestEntity();
    console.log("Created new waypoint #" + this.numWaypoints + "." );
    ++this.numWaypoints;
    newWaypointElement.setAttribute( 'position', location );
  },
  handleClick: function(ev, self) { 
    var hitObjectLocation = ev.detail.intersection.point;
    var hitObjectClass = ev.detail.intersection.object.el.className;    

    if ( hitObjectClass === 'floor' )
    {
      var activeAvatarEl = self.getActiveAvatarEl( self );
      if ( activeAvatarEl.id === 'keysWorldCamera' )
      {
        self.createWaypoint( self, hitObjectLocation ); //Else assume it's an existing waypoint.
        self.movePlayerToLocation( self, hitObjectLocation );
      }
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      self.movePlayerToLocation( hitObjectLocation );
    }
  },
  init: function() { 
    //This if-guard helps prevent addEventListener from running multiple times,
    //Because there's no way to move the cursor between camera parent elements without reinitializing components.
    if ( this.numWaypoints === undefined )
    {
      this.numWaypoints = 0;
 
      var _self = this; //Have to be sure to do this to self-ref the handleClick func below.
      this.el.addEventListener( 'click', function(event) { _self.handleClick(event, _self); } );
    }
  }
} );
