AFRAME.registerComponent( 'spawn-foes-on-click', {
  getRandomPosition: function() {
    var position = this.el.components.position.data;
    var maxNodeX = 4;
    var maxNodeY = maxNodeX/2;
    var maxNodeZ = maxNodeX;
    position.x = Math.floor( ( Math.random() * 2*maxNodeX ) - maxNodeX );
    position.y = Math.floor( Math.random() * maxNodeY ); //Can be negative XZ coords, but only +y.
    position.z = Math.floor( ( Math.random() * 2*maxNodeZ ) - maxNodeZ );
    return position;
  },
  spawn: function( self ) { 
    var randomColor = this.el.sceneEl.components.samsara_global.getRandomColor();
    this.el.setAttribute( 'material', 'color', randomColor ); //Feedback so user knows it spawned.
    
    var newFoe = self.el.sceneEl.components.pool__foes.requestEntity(); 
    newFoe.setAttribute( 'position', self.getRandomPosition() );
    newFoe.setAttribute( 'mixin', self.data.mixin ); //KEY!
    newFoe.play(); //Else it remains paused and won't run event listeners.
  },
  schema: {
    mixin: { default : '' } //What to spawn.
  },
  init: function() {    
    var self = this; //Have to be sure to do this to self-ref the spawn func below.
    this.el.addEventListener( 'click', function() { self.spawn( self ); } );
  }
} );
