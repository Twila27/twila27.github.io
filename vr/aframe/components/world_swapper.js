AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self ) {
    var manager = self.el.sceneEl.components.samsara_global;
    var oldActiveCameraEl = manager.getActiveAvatarEl();
    var newActiveCameraEl = manager.getInactiveAvatarEl();
    newActiveCameraEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
    
    //Now also move the a-cursor over.
    var cursorEl = oldActiveCameraEl.querySelector('#cursor');
    //var eventlessClone = cursorEl.cloneNode(true);
    //cursorEl.removeAttribute('cursor-listener'); //To ensure it does not try anything funny.
    oldActiveCameraEl.removeChild(cursorEl);
    newActiveCameraEl.appendChild(cursorEl);
  },
  schema: {
    isKeysWorld : { type : 'boolean' }, //Else assume it's the other world.
    initialDecayBarMax : { default : 100.0 }
  },
  init: function() { 
    var self = this;
    this.el.addEventListener( 'click', function() { self.swapWorlds( self ); } );
    
    this.decayBarCurrentMax = this.data.initialDecayBarMax;
    this.decayBarCurrentValue = this.decayBarCurrentMax;
    
    if ( this.data.isKeysWorld )
      this.followedAvatar = this.el.sceneEl.querySelector('#keysWorldCamera');
    else //Assumption it's the other world's swap button.
      this.followedAvatar = this.el.sceneEl.querySelector('#foesWorldCamera');
  },
  setDecayMax: function(newVal) {
    this.decayBarCurrentMax = newVal;
  },
  addToDecayMax: function(delta) {
    this.decayBarCurrentMax += delta;
  },
  setDecayValue: function(newVal) {
    this.decayBarCurrentValue = newVal;
  },
  addDecay: function(healDelta) {
    if ( ( this.decayBarCurrentValue + healDelta ) <= this.decayBarCurrentMax )
      this.decayBarCurrentValue += healDelta;
  },
  removeDecay: function(decayDelta) {
    if ( ( this.decayBarCurrentValue - decayDelta ) > 0 )
      this.decayBarCurrentValue -= decayDelta;
  },
  tick: function() {
    var newPosition = this.followedAvatar.getAttribute( 'position' ); //Can't store reference to array, only object (itself a ref).
    const HEIGHT_OFFSET_FROM_CAMERA = 2;
    this.el.setAttribute( 'position', { x:newPosition.x, y:newPosition.y + HEIGHT_OFFSET_FROM_CAMERA, z:newPosition.z } );
    
    var currentTheta = ( this.decayBarCurrentValue / this.decayBarCurrentMax ) * 360.0;
    this.el.setAttribute( 'geometry', 'thetaLength', currentTheta );
  }
} );
