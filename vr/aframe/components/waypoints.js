AFRAME.registerComponent( 'cursor-listener', {
  handleClick: function(ev) { 
    var hit = ev.detail.intersection.point;
    console.log( hit ); 
    
    //var newCombatNodeElement = document.createElement('a-entity');
    var newWaypointElement = this._t.el.sceneEl.components.pool__waypoints.requestEntity();
    //Don't need to appendChild to anything here.
    newWaypointElement.setAttribute( 'geometry', { primitive: 'cylinder', height: 1, radius: 2 } );
    newWaypointElement.setAttribute( 'material', 'color', 'yellow' );
    newWaypointElement.setAttribute( 'position', { x:hit.x, y:hit.y+1, z:hit.z } );
  },
  init: function() { 
    this._t = this; 
    this.el.addEventListener( 'click', this.handleClick );
  }
} );

AFRAME.registerComponent( 'waypoint', {
  
} );
