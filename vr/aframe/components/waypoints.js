AFRAME.registerComponent( 'cursor-listener', {
  handleClick: function(ev) { console.log( ev.detail.intersection.point ); },
  init: function() { this.el.addEventListener( 'click', this.handleClick ) }
} );

AFRAME.registerComponent( 'waypoint', {

} );
