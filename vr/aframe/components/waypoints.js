AFRAME.registerComponent( 'cursor-listener', {
  movePlayerToLocation: function( worldSpaceLocation, activeAvatarEl ) {
    var avatarHeight = activeAvatarEl.getAttribute( 'position' ).y; //Preserving it, as worldSpaceLocation is at floor level.
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:avatarHeight, z:worldSpaceLocation.z } );
  },
  createWaypoint: function( location, globalManagerComponent ) {
    var newWaypointElement = this.el.sceneEl.components.pool__waypoints.requestEntity();
    console.log("Created new waypoint #" + globalManagerComponent.numWaypoints + "." );
    ++globalManagerComponent.numWaypoints;
    newWaypointElement.setAttribute( 'position', location );
  },
  handleClick: function( ev, globalManagerComponent ) { 
    var hitObjectLocation = ev.detail.intersection.point;
    var hitObjectClass = ev.detail.intersection.object.el.className;    

    if ( hitObjectClass === 'floor' )
    {
      var activeAvatarEl = globalManagerComponent.getActiveAvatarEl();
      if ( activeAvatarEl.id === 'keysWorldCamera' )
      {
        this.createWaypoint( hitObjectLocation, globalManagerComponent ); //Else assume it's an existing waypoint.
        this.movePlayerToLocation( hitObjectLocation, globalManagerComponent, activeAvatarEl );
      }
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      this.movePlayerToLocation( hitObjectLocation );
    }
  }
} );
