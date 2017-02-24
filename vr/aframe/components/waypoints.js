AFRAME.registerComponent( 'cursor-listener', {
  getActiveAvatarEl: function() { 
    return this.el.sceneEl.components.samsara_global.getActiveAvatarEl();
  },
  incrementNumWaypoints: function() {
    return this.el.sceneEl.components.samsara_global.incrementNumWaypoints();
  },
  movePlayerToLocation: function( worldSpaceLocation, activeAvatarEl ) {
    var avatarHeight = activeAvatarEl.getAttribute( 'position' ).y; //Preserving it, as worldSpaceLocation is at floor level.
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:avatarHeight, z:worldSpaceLocation.z } );
  },
  pullWaypointFromPool: function() {
    //Come back and replace this with any necessary returnEntity(oldestWaypoint) calls.
    return this.el.sceneEl.components.pool__waypoints.requestEntity();
  },
  createWaypoint: function( location ) {
    var newWaypointElement = this.pullWaypointFromPool();
    this.incrementNumWaypoints();
    newWaypointElement.setAttribute( 'position', location );
  },
  handleClick: function(ev) { 
    var hitObjectLocation = ev.detail.intersection.point;
    var hitObjectClass = ev.detail.intersection.object.el.className;    

    if ( hitObjectClass === 'floor' )
    {
      var activeAvatarEl = this.getActiveAvatarEl();
      if ( activeAvatarEl.id === 'keysWorldCamera' )
      {
        this.createWaypoint( hitObjectLocation ); //Else assume it's an existing waypoint.
        this.movePlayerToLocation( hitObjectLocation, activeAvatarEl );
      }
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      this.movePlayerToLocation( hitObjectLocation );
    }
  },
  init: function() { //Will be re-run upon every appendChild in world-swapper.
    this.el.addEventListener( 'click', this.handleClick );
  },
  remove: function() { //So we remove listeners here to prevent pile-up.
   console.log("REMOVE HIT");
   this.el.removeEventListener( 'click', this.handleClick );
  }
} );
