AFRAME.registerComponent( 'cursor-listener', {
  handleClick: function(ev) { 
    var hit = ev.detail.intersection.point;
    console.log( hit ); 
    
    //var newCombatNodeElement = document.createElement('a-entity');
    var newWaypointElement = this.el.sceneEl.components.pool__waypoints.requestEntity();
    //Don't need to appendChild to anything here.
    newWaypointElement.setAttribute( 'geometry', { primitive: 'cylinder', height: 1, radius: 2 } );
    newWaypointElement.setAttribute( 'material', 'color', 'yellow' );
    newWaypointElement.setAttribute( 'position', hit );
    newWaypointElement.setAttribute( 'position', 'y', hit.y+1 );
  },
  init: function() { this.el.addEventListener( 'click', this.handleClick ) }
} );

AFRAME.registerComponent( 'waypoint', {
  
} );
