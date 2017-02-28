AFRAME.registerComponent( 'world-swapper', { //Make this the mouseover-slowly-spinning Samsara logo above your head?
  swapWorlds: function( self, forceSwap = false ) {
    if ( !forceSwap && ( this.decayBarCurrentValue !== this.decayBarCurrentMax ) ) //Only allow swap at max unless forced after a decay.
    {
      this.playSound("swapBonk");
      return;
    } 
    
    var manager = self.el.sceneEl.components.samsara_global;
    var oldActiveCameraEl = manager.getActiveAvatarEl();
    var newActiveCameraEl = manager.getInactiveAvatarEl();
    newActiveCameraEl.setAttribute( 'camera', 'active', true ); //Should auto-shutoff active camera.
    
    //Now also move the cursor over.
    var cursorEl = oldActiveCameraEl.querySelector('#cursor');
    oldActiveCameraEl.removeChild(cursorEl);
    newActiveCameraEl.appendChild(cursorEl);
    
    this.playSound("swapActivating");
  },
  schema: {
    isKeysWorld : { type : 'boolean' }, //Else assume it's the other world.
    initialDecayBarMaxMilliseconds : { default : 5000.0 }
  },
  init: function() { 
    var self = this;
    this.el.addEventListener( 'click', function() { self.swapWorlds( self ); } );
    this.el.addEventListener( 'door_opened', function() { self.startDecay( self ); } );
    
    this.decayBarCurrentMax = this.data.initialDecayBarMaxMilliseconds;
    this.decayBarCurrentValue = this.decayBarCurrentMax;
    this.numDecayTicks = 0;
    this.TICKS_PER_SOUND = 10;
    
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
        this.playSound("swapFilled");
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
  playSound: function(soundName) {
    this.el.sceneEl.components.samsara_global.playSound(soundName, this.el.getAttribute("position") ); 
  }
} );
