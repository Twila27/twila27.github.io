var names = [];
var numInits = 0;
function clickListener (event) { //In global scope to keep it free of the repeatedly run init handler below.
    var cursorListenerComponent = document.querySelector( '#cursor' ).components['cursor-listener'];
    cursorListenerComponent.handleClick( event ); //Second argument to let it access its methods.
};

AFRAME.registerComponent( 'cursor-listener', {
  playSound: function(name) {
    return this.el.sceneEl.components.samsara_global.playSound(name);  
  },
  getActiveAvatarEl: function() { 
    return this.el.sceneEl.components.samsara_global.getActiveAvatarEl();
  },
  getCurrentNumWaypoints: function() {
    return this.el.sceneEl.components.samsara_global.getCurrentNumWaypoints();
  },
  incrementNumWaypoints: function() {
    return this.el.sceneEl.components.samsara_global.incrementNumWaypoints();
  },
  movePlayerToLocation: function( worldSpaceLocation, activeAvatarEl ) {
    var avatarHeight = activeAvatarEl.getAttribute( 'position' ).y; //Preserving it, as worldSpaceLocation is at floor level.
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:avatarHeight, z:worldSpaceLocation.z } );
    this.playSound("waypointCreated", this.el.getAttribute("position") );
  },
  pullWaypointFromPool: function( self ) {
    if ( self === undefined )
        return; //Too early.
        
    var waypointsPool = self.el.sceneEl.components.pool__waypoints;
    const maxNumWaypoints = waypointsPool.data.size;
    if ( ( self.getCurrentNumWaypoints() + 1 ) > maxNumWaypoints )
    {
      var oldestWaypointEl = self.waypointsArray.shift(); //effectively pop_front().
      self.el.sceneEl.components.pool__waypoints.returnEntity(oldestWaypointEl);        
    }
    
    var newWaypoint = self.el.sceneEl.components.pool__waypoints.requestEntity();
    self.waypointsArray.push(newWaypoint);
      
    return newWaypoint;
  },
  beginCooldown: function() {
    this.isCoolingDown = true;
    this.millisecondsLeftUntilCooledDown = this.waypointCooldownMilliseconds;
  },
  createWaypoint: function( keysWorldLocation ) {
    this.beginCooldown();
    var newWaypointElement = this.pullWaypointFromPool( this );
    this.incrementNumWaypoints(); 
    newWaypointElement.setAttribute( 'animation', {
     property: 'rotation',
     loop: true,
     dur: 5000,
     easing: 'linear',
     from: '0 0 0',
     to: '0 -360 0',
     startEvents: 'mouseenter',
     pauseEvents: 'mouseleave'
    });
//    newWaypointElement.setAttribute( 'animation__color', { //Overridden by the obj-model's mtl.
//     property: 'color',
//     dir: 'alternate',
//     loop: true,
//     dur: 1000,
//     easing: 'easeInSine',
//     to: 'green'
//    });
    newWaypointElement.setAttribute( 'position', keysWorldLocation );
    newWaypointElement.className = 'waypoint';
    
    var keysWorldOrigin = this.el.sceneEl.components.samsara_global.getKeysWorldOrigin();
    var foesWorldOrigin = this.el.sceneEl.components.samsara_global.getFoesWorldOrigin();
    var offsetFromOrigin = {
        x : keysWorldLocation.x - keysWorldOrigin.x,
        y : keysWorldLocation.y - keysWorldOrigin.y,
        z : keysWorldLocation.z - keysWorldOrigin.z
    };
    var foesWorldLocation = {
        x : foesWorldOrigin.x + offsetFromOrigin.x,
        y : foesWorldOrigin.y + offsetFromOrigin.y,
        z : foesWorldOrigin.z + offsetFromOrigin.z
    };
    
    var newMirrorWaypointElement = this.pullWaypointFromPool( this );
    this.incrementNumWaypoints();
    newMirrorWaypointElement.setAttribute( 'position', foesWorldLocation );    
    newMirrorWaypointElement.setAttribute( 'animation', {
     property: 'rotation',
     loop: true,
     dur: 5000,
     easing: 'linear',
     from: '0 0 0',
     to: '0 -360 0',
     startEvents: 'mouseenter',
     pauseEvents: 'mouseleave'
    });
//    newMirrorWaypointElement.setAttribute( 'animation__color', { //Overridden by the obj-model's mtl.
//     property: 'color',
//     dir: 'alternate',
//     loop: true,
//     dur: 1000,
//     easing: 'easeInSine',
//     to: 'green'
//    });
    newMirrorWaypointElement.className = 'waypoint';
    
    //Else animations won't play:
    newWaypointElement.play();
    newMirrorWaypointElement.play();
  },
  handleClick: function( event ) { 
    console.log( this.name + " HandleClick called for me." );
    if ( this.isCoolingDown )
    {
      console.log( this.name + " HandleClick ignored, still cooling down." );
      return;
    }
    
    var self = document.querySelector( '#cursor' ).components['cursor-listener'];
    var hitObjectLocation = event.detail.intersection.point;
    var hitObjectClass = event.detail.intersection.object.el.className;    

    var activeAvatarEl = self.getActiveAvatarEl();
    if ( hitObjectClass === 'floor' )
    {
      if ( activeAvatarEl.id === 'keysWorldCamera' ) //Prevent foes world from adding waypoints.
      {
        self.createWaypoint( hitObjectLocation );
//      self.movePlayerToLocation( hitObjectLocation, activeAvatarEl ); //Comment it out, and you have to click again after placing waypoints.
      }
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      self.movePlayerToLocation( hitObjectLocation, activeAvatarEl );
    }
  },
  tick: function(time, timeDelta) {
      if ( this.isCoolingDown )
      {
          if ( this.millisecondsLeftUntilCooledDown > 0.0 )
          {
            this.millisecondsLeftUntilCooledDown -= timeDelta;
          }
          else
          {
            this.playSound("waypointCooledOff", this.el.components.position );
            this.isCoolingDown = false;
          }
      }
  },
  schema: {
    waypointCooldownMilliseconds : { default : 1000.0 }  
  },
  init: function() { //Will be re-run upon every appendChild in world-swapper.
    this.isCoolingDown = false;
    this.millisecondsLeftUntilCooledDown = 0.0;
    this.waypointsArray = [];

    this.name = "I am init run #" + numInits + ".";
    names.push( name );
    ++numInits;
      
    this.el.addEventListener( 'click', clickListener ); //Handle to listener for remove() below.
  },
  remove: function() { //So we remove listeners here to prevent pile-up.
    this.el.removeEventListener( 'click', clickListener );
  }
} );
