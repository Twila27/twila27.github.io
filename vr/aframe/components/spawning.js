AFRAME.registerComponent( 'spawns-foes', {
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
    if ( this.numToSpawn > 0 )
      --this.numSpawnsLeft;
    else
      return;
    
    var randomColor = this.el.sceneEl.components.samsara_global.getRandomColor();
    this.el.setAttribute( 'material', 'color', randomColor ); //Feedback so user knows it spawned.
    
    var newFoe = self.el.sceneEl.components.pool__foes.requestEntity(); 
    newFoe.spawner = this;
    newFoe.setAttribute( 'position', self.getRandomPosition() );
    newFoe.setAttribute( 'mixin', self.data.mixin ); //KEY!
    newFoe.play(); //Else it remains paused and won't run event listeners.
  },
  onFoePopped: function(foeEl) {
    console.log("Spawner onFoePopped hit!");
    this.el.sceneEl.components.pool__foes.returnEntity( foeEl );

    if ( this.numSpawnsLeft == 0 )
      this.el.parentNode.removeChild( this.el );
  },
  schema: {
    mixin: { default : '' }, //What to spawn.
    numToSpawn: { default : 1 }, //Per trip through the room, since room_loader recreates it.
    spawnEvent: { default : 'global_spawn' }
  },
  init: function() {
    var self = this; //Have to be sure to do this to self-ref the spawn func below.
    this.el.addEventListener( this.data.spawnEvent, function() { self.spawn( self ); } );
    
    this.el.setAttribute( 'animation', {
     property: 'rotation',
     loop: true,
     dur: 5000,
     easing: 'linear',
     to: '0 -270 0'
    });
//    this.el.setAttribute( 'animation__color', { //Overridden by the obj-model's mtl.
//     property: 'color',
//     dir: 'alternate',
//     loop: true,
//     dur: 1000,
//     easing: 'easeInSine',
//     from: '#ffffff', //Normal full tint.
//     to: '#000000'
//    });
    
    this.numSpawnsLeft = this.data.numToSpawn;
  }
} );
