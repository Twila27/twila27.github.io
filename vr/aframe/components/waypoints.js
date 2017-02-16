AFRAME.registerComponent( 'cursor-listener', {
  handleClick: function(ev, self) { 
    var hit = ev.detail.intersection.point;
    console.log( hit ); 

    //var newCombatNodeElement = document.createElement('a-entity');
    var newWaypointElement = self.el.sceneEl.components.pool__waypoints.requestEntity();
    //Don't need to appendChild to anything here.
    newWaypointElement.setAttribute( 'geometry', { primitive: 'cylinder', height: 0.1, radius: 1.0 } );
    newWaypointElement.setAttribute( 'material', 'color', 'yellow' );
    newWaypointElement.setAttribute( 'position', hit );
  },
  init: function() { 
    var _self = this;
    this.el.addEventListener( 'click', function(event) { _self.handleClick(event, _self); } );
  }
} );

AFRAME.registerComponent( 'waypoint', {
  
} );
