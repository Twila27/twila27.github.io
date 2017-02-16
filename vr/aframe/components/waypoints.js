AFRAME.registerComponent( 'cursor-listener', {
  getActiveCameraEl: function() {
      var keysCameraEl = document.querySelector('#keysWorldCamera');
      if ( keysCameraEl.components.camera.active )
        return keysCameraEl;
      
      var foesCameraEl = document.querySelector('#foesWorldCamera');
      if ( foesCameraEl.components.camera.active )
        return foesCameraEl;
 
      return undefined;
  },
  movePlayerToLocation: function( worldSpaceLocation ) {
    var activeCameraEl = this.getActiveCameraEl();
    var cameraHeight = activeCameraEl.getAttribute( 'position' ).y;
    activeCameraEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:cameraHeight, z:worldSpaceLocation.z } );
  },
  createWaypoint: function( self ) {
    var newWaypointElement = self.el.sceneEl.components.pool__waypoints.requestEntity();
    newWaypointElement.setAttribute( 'position', hitObjectLocation );
  },
  handleClick: function(ev, self) { 
    var hitObjectLocation = ev.detail.intersection.point;
    var hitObjectClass = ev.detail.intersection.object.el.className;
    console.log( hitObjectClass ); 

    //var newCombatNodeElement = document.createElement('a-entity');
    if ( hitObjectClass === 'floor' )
      this.createWaypoint( self ); //Else assume it's an existing waypoint.
    
    this.movePlayerToLocation( hitObjectLocation );
  },
  init: function() { 
    var _self = this; //Have to be sure to do this to self-ref the handleClick func below.
    this.el.addEventListener( 'click', function(event) { _self.handleClick(event, _self); } );
  }
} );

AFRAME.registerComponent( 'waypoint', {
  schema: {
    geometry: { default : { primitive: 'cylinder', height: 0.1, radius: 1.0 } },
    material: { default : { color: 'yellow' } }
  },
  init: function() {
    this.el.setAttribute( 'geometry', this.data.geometry );
    this.el.setAttribute( 'material', this.data.material );
    this.el.setAttribute( 'class', 'waypoint' );
  }
} );
