AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self, forceSwap = false ) {
    if ( !forceSwap && ( this.decayBarCurrentValue !== this.decayBarCurrentMax ) ) //Only allow swap at max unless forced after a decay.
    {
      this.playSound("swapBonk", this.el.object3D.getWorldPosition() );
      return;
    } 
        
    var manager = self.el.sceneEl.components.samsara_global;
    var oldActiveCameraEl = manager.getActiveAvatarEl();
    var newActiveCameraEl = manager.getInactiveAvatarEl();
    
    var oldCursorEl = oldActiveCameraEl.querySelector('#cursor');
    var newCursorEl = newActiveCameraEl.querySelector('#cursorNextSwap');
    oldCursorEl.removeAttribute( 'cursor' );
    oldCursorEl.removeAttribute( 'raycaster' );
    oldCursorEl.id = 'cursorNextSwap';
    newCursorEl.setAttribute( 'cursor', {} );
    newCursorEl.id = 'cursor';

    newActiveCameraEl.setAttribute( 'camera', 'userHeight', 1.6 );
    newActiveCameraEl.setAttribute( 'camera', 'active', true ); //Runs auto-off on old active camera.

    //We want this sound playing on both, so when we warp over we don't lose the sound.
    this.playSound("swapActivating", this.el.object3D.getWorldPosition() );
    if ( this.data.isKeysWorld )
      this.playSound("swapActivating", document.querySelector('#foesWorldSwapButton').object3D.getWorldPosition() );
    else
      this.playSound("swapActivating", document.querySelector('#keysWorldSwapButton').object3D.getWorldPosition() );
  },
  schema: {
    isKeysWorld : { type : 'boolean' }, //Else assume it's the other world.
    initialDecayBarMaxMilliseconds : { default : 5000.0 }
  },
  init: function() { 
    var self = this;
    this.el.addEventListener( 'click', function() { self.swapWorlds( self ); } );
    
    this.decayBarCurrentMax = this.data.initialDecayBarMaxMilliseconds;
    this.decayBarCurrentValue = this.decayBarCurrentMax;
    this.numDecayTicks = 0;
    this.TICKS_PER_SOUND = 50;
    
    if ( this.data.isKeysWorld )
      this.followedAvatar = this.el.sceneEl.querySelector('#keysWorldCamera');
    else //Assumption it's the other world's swap button.
      this.followedAvatar = this.el.sceneEl.querySelector('#foesWorldCamera');
  },
  setDecayMax: function(newVal) {
    this.decayBarCurrentMax = newVal;
  },
  addToDecayMax: function(delta) { //FUTURE: having powerups for doing this.
    this.decayBarCurrentMax += delta;
  },
  setDecayValue: function(newVal) {
    this.decayBarCurrentValue = newVal;    
  },
  addToSwapBar: function(healDelta) {
    if ( ( this.decayBarCurrentValue + healDelta ) <= this.decayBarCurrentMax )
    {
      this.decayBarCurrentValue += healDelta;
      if ( this.decayBarCurrentValue === this.decayBarCurrentMax )
        this.playSound("swapFilled",  this.el.object3D.getWorldPosition() );
      else
        this.playSound("swapFilling");
    }
  },
  removeFromSwapBar: function(decayDelta) {    
    if ( ( this.decayBarCurrentValue - decayDelta ) >= 0.0 )
    {
      this.decayBarCurrentValue -= decayDelta;
      if ( this.data.isKeysWorld && ( this.decayBarCurrentValue == 0.0 ) )
      {
        this.swapWorlds(this, true);
        return true; //Did kick.
      }
      else if ( this.numDecayTicks++ > this.TICKS_PER_SOUND )
      {
        this.numDecayTicks = 0;
        this.playSound("swapDecaying");
      }
    }
    else if ( this.decayBarCurrentValue > 0.0 )
    {
      this.decayBarCurrentValue = 0.0;
      if ( this.data.isKeysWorld )
      {
        this.swapWorlds(this, true);
        return true; //Did kick.
      }
      else if ( this.numDecayTicks++ > this.TICKS_PER_SOUND )
      {
        this.numDecayTicks = 0;
        this.playSound("swapDecaying");
      }
    }
    
    return false; //Did not kick.
  },
  tick: function() {
    var newPosition = this.followedAvatar.getAttribute( 'position' ); //Can't store reference to array, only object (itself a ref).
    const HEIGHT_OFFSET_FROM_CAMERA = 2;
    this.el.setAttribute( 'position', { x:newPosition.x, y:newPosition.y + HEIGHT_OFFSET_FROM_CAMERA, z:newPosition.z } );
    
    var currentTheta = ( this.decayBarCurrentValue / this.decayBarCurrentMax ) * 360.0;
    this.el.setAttribute( 'geometry', 'thetaLength', currentTheta );
  },
  playSound: function(soundName, position = this.el.components.position.data, volume = .01) {
    this.el.sceneEl.components.samsara_global.playSound( soundName, position, volume ); 
  }
} );
