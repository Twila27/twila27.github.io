AFRAME.registerComponent( 'door_opener' , {
  schema: {
    nodeMixin: { default : '' },
    doorNodeAppearedSoundName: { type : 'string' },
    doorOpenSoundName: { type : 'string' },
    doorRoomID: { default : -1 },
    showNodeImmediately: { default : false }
  },
  spawnDoorNode: function( side ) { //May have to do it on one side or the other.
    var doorNodeEl = document.createElement('a-entity');
    var nodeOffsetFromDoor = ( side == 'forward' ) ? -3 : 3;
    var nodePositionFromDoor = { x:0, y:0, z:nodeOffsetFromDoor };

    doorNodeEl.setAttribute( 'combat-node', { 
      nodeMixin: this.data.nodeMixin,
      positionOffset: nodePositionFromDoor,
      popSFX: self.data.doorOpenSoundName,
      gazeTimeMilliseconds: this.data.nodeGazeTimeMilliseconds
    } );
    doorNodeEl.setAttribute( 'mixin', this.data.nodeMixin );
    
    this.el.appendChild( doorNodeEl );
    this.playSound( this.data.doorNodeAppearedSoundName );
  },
  playSound: function(soundName) {
    this.el.sceneEl.components.samsara_global.playSound(soundName);
  },
  areAllSpawnersClear: function() {
    return this.el.sceneEl.components.samsara_global.areAllSpawnersClear();
  },
  openDoor: function() {
    if ( this.data.doorRoomID == -1 )
      console.log("No doorRoomId given to schema by room_loader!");
    else
      this.el.emit( 'door_opened', this.data.doorRoomID );
  },
  onNodePopped: function(poppedNodeEl) {
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
