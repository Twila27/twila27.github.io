AFRAME.registerComponent( 'spawns-foes', {
  getRandomPosition: function() {
    var position = this.el.components.position.data;
    var randomPosition;
    var maxNodeX = 4;
    var maxNodeY = maxNodeX/2;
    var maxNodeZ = maxNodeX;
    randomPosition.x = position.x + Math.floor( ( Math.random() * 2*maxNodeX ) - maxNodeX );
    randomPosition.y = position.y + Math.floor( Math.random() * maxNodeY ); //Can be negative XZ coords, but only +y.
    randomPosition.z = position.z + Math.floor( ( Math.random() * 2*maxNodeZ ) - maxNodeZ );
    return randomPosition;
  },
  spawn: function() { 
    if ( this.numSpawnsLeft > 0 )
      --this.numSpawnsLeft;
    else
      return;

    var newFoe = this.el.sceneEl.components.pool__foes.requestEntity(); 
    newFoe.spawner = this;
    var offset = this.getRandomPosition();
    var position = this.el.components.position.data;
    position.x += offset.x;
    position.y += offset.y;
    position.z += offset.z;    
    newFoe.setAttribute( 'position', position );
    newFoe.setAttribute( 'mixin', this.data.mixin ); //KEY!
    newFoe.play(); //Else it remains paused and won't run event listeners.    
    
    var manager = this.el.sceneEl.components.samsara_global;
    manager.incrementNumFoesInRoom( this.data.roomID );
    manager.playSound("foeSpawned");
  },
  onFoePopped: function(foeEl) {
    console.log("Spawner onFoePopped hit!");
    
    var sceneComponents = this.el.sceneEl.components;
    sceneComponents.pool__foes.returnEntity( foeEl );
    
    var manager = sceneComponents.samsara_global;
    manager.decrementNumFoesInRoom( this.roomID  );
    
    if ( this.numSpawnsLeft == 0 )
    {
      manager.decrementNumSpawnersInRoom( this.roomID ); //(Increment called in room_loader.)
      this.el.parentNode.removeChild( this.el );
    }
  },
  schema: {
    mixin: { default : '' }, //What to spawn.
    numToSpawn: { default : 1 }, //Per trip through the room, since room_loader recreates it.
    spawnEvent: { default : 'global_spawn' },
    spawnMaxCoords: { type : 'vec3' },
    roomID : { type : 'int' }
  },
  init: function() {
    var self = this; //Have to be sure to do this to self-ref the spawn func below.
    this.el.addEventListener( this.data.spawnEvent, function(ev) { 
      var activeRoomID = ev.detail;
      if ( activeRoomID == this.data.roomID )
        self.spawn(); 
    });
    
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
    
    this.el.play();
  }
} );
