AFRAME.registerComponent( 'door_opener' , {
  schema: {
    isKeysWorld: { type : 'boolean' },
    nodeMixin: { default : '' },
    doorNodeAppearedSoundName: { type : 'string', default : 'doorNodeAppeared' },
    doorOpenSoundName: { type : 'string', default : 'doorOpen' },
    doorRoomID: { default : -1 },
    showNodeImmediately: { default : false },
    nodeGazeTimeMilliseconds: { default : 0.0 }
  },
  spawnDoorNode: function( side ) { //May have to do it on one side or the other.
    var doorNodeEl = document.createElement('a-entity');
    var nodeOffsetFromDoor = ( side == 'forward' ) ? 13 : -13;
    var nodePositionFromDoor = { x:0, y:12, z:nodeOffsetFromDoor };

    doorNodeEl.setAttribute( 'combat-node', { 
      positionOffset: nodePositionFromDoor,
      popSFX: this.data.doorOpenSoundName,
      gazeTimeMilliseconds: this.data.nodeGazeTimeMilliseconds
    } );
    doorNodeEl.setAttribute( 'mixin', this.data.nodeMixin );
    
    this.el.appendChild( doorNodeEl );
    this.playSound( this.data.doorNodeAppearedSoundName, doorNodeEl.getAttribute("position") );
  },
  playSound: function(soundName, position = undefined) {
    this.el.sceneEl.components.samsara_global.playSound(soundName, position);
  },
  areAllSpawnersClear: function() {
    return this.el.sceneEl.components.samsara_global.areAllSpawnersClear();
  },
  openDoor: function() {
    if ( this.data.doorRoomID == -1 )
      console.log("No doorRoomId given to schema by room_loader!");
    else
      this.el.emit( 'door_opened', { doorRoomID : this.data.doorRoomID, isKeysWorld: this.data.isKeysWorld } );
    
    var currPos = this.el.getAttribute('position');
    this.el.setAttribute( 'animation', {
      property: 'position',
      dur: 3000,
      from: currPos.x + ' ' + currPos.y + ' ' + currPos.z,
      to: currPos.x + ' -7.0 ' + currPos.z,
    });
  },
  onNodePopped: function(poppedNodeEl) {
    poppedNodeEl.removeAttribute( 'combat-node' ); //Stop it from ticking, else it'll crash on removal.
    this.el.removeChild( poppedNodeEl ); //Actually toss the combat-node. 
    this.openDoor();
  },
  tick: function() {
    if ( !this.showNodeImmediately && this.areAllSpawnersClear() )
      this.spawnDoorNode( 'forward' );
  },
  init: function() {
    this.showNodeImmediately = this.data.showNodeImmediately;
    if ( this.showNodeImmediately )
      this.spawnDoorNode( 'forward' );
  }
});
