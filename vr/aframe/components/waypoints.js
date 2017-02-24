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
    //TODO: Add logic to create the waypoint on the other floor next.
  },
  handleClick: function( event, self ) { 
    var hitObjectLocation = event.detail.intersection.point;
    var hitObjectClass = event.detail.intersection.object.el.className;    

    if ( hitObjectClass === 'floor' )
    {
      var activeAvatarEl = self.getActiveAvatarEl();
      if ( activeAvatarEl.id === 'keysWorldCamera' ) //Prevent foes world from adding waypoints.
      {
        this.createWaypoint( hitObjectLocation );
        this.movePlayerToLocation( hitObjectLocation, activeAvatarEl );
      }
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      this.movePlayerToLocation( hitObjectLocation );
    }
  },
  init: function() { //Will be re-run upon every appendChild in world-swapper.
    var self = this; //For access in below function scope.
    //this.clickListener = function( event ) { self.handleClick( event, self ); };
      //This approach fails because like C++ lambda anon functions are treated as separate types.
      //JavaScript DOM API will ignore duplicate typed listeners, so we try instead to access it by proxy:
    var clickListener = this.el.sceneEl.components.samsara_global.getCursorClickHandler();
    this.el.addEventListener( 'click', this.clickListener ); //Handle to listener for remove() below.
  },
  remove: function() { //So we remove listeners here to prevent pile-up.
   this.el.removeEventListener( 'click', this.clickListener );
  }
} );
