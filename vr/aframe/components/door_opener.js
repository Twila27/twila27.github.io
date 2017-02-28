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
    doorNodeEl.setAttribute( 'animation__position', {
      property: 'position',
      dir: 'alternate',
      dur: 1000,
      from: nodePositionFromDoor.x + ' ' + nodePositionFromDoor.y + ' ' + nodePositionFromDoor.z,
      to: nodePositionFromDoor.x + ' ' + nodePositionFromDoor.y*2.25 + ' ' + nodePositionFromDoor.z,
      startEvents: 'mouseenter',
      pauseEvents: 'mouseleave'
    });
    
    doorNodeEl.setAttribute( 'animation__scale', {
      property: 'scale',
      dir: 'alternate',
      dur: 1000,
      from: '1 1 1',
      to: '3 3 3',
      startEvents: 'mouseenter',
      pauseEvents: 'mouseleave'
    });
    
    this.el.appendChild( doorNodeEl ); //Because we just appended, need to build world-space position ourselves.
    var doorPosition = this.el.components.position.data;
    var worldSpaceChildPosition = {
      x:doorPosition.x + nodePositionFromDoor.x,
      y:doorPosition.y + nodePositionFromDoor.y,
      z:doorPosition.z + nodePositionFromDoor.z
    };
    this.playSound( this.data.doorNodeAppearedSoundName, worldSpaceChildPosition );
  },
  playSound: function(soundName, position = undefined) {
    this.el.sceneEl.components.samsara_global.playSound(soundName, position);
  },
  areAllSpawnersClear: function() {
    return this.el.sceneEl.components.samsara_global.areAllSpawnersClear();
  },
  openDoor: function() {
    var newRoomID = this.data.doorRoomID;
    if ( newRoomID == -1 )
      console.log("No doorRoomId given to schema by room_loader!");
    else
      this.el.emit( 'door_opened', { doorRoomID : newRoomID, isKeysWorld: this.data.isKeysWorld } );
    
    var currPos = this.el.getAttribute('position');
    this.el.setAttribute( 'animation', {
      property: 'position',
      dur: 3000,
      from: currPos.x + ' ' + currPos.y + ' ' + currPos.z,
      to: currPos.x + ' -7.0 ' + currPos.z,
    });
    
    var oldRoomBgm = document.querySelector('#roomBgm' + (newRoomID-1) );
    if ( oldRoomBgm !== null )
      oldRoomBgm.pause();
    
    var newRoomBgm = document.querySelector('#roomBgm' + newRoomID );   
    if ( newRoomBgm !== null )
    {
      newRoomBgm.volume = 0.3;
      newRoomBgm.play(); //HTML5 audio DOM API.
    }
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
