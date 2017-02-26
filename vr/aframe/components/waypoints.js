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
  },
  pullWaypointFromPool: function() {
    var waypointsPool = this.el.sceneEl.components.pool__waypoints;
    const maxNumWaypoints = waypointsPool.size;
    if ( ( this.getCurrentNumWaypoints() + 1 ) > maxNumWaypoints )
    {
      var oldestWaypointEl = this.waypointsArray.shift(); //effectively pop_front().
      this.el.sceneEl.components.pool__waypoints.returnEntity(oldestWaypointEl);        
    }
    
    var newWaypoint = this.el.sceneEl.components.pool__waypoints.requestEntity();
    this.waypointsArray.push(newWaypoint);
      
    return newWaypoint;
  },
  beginCooldown: function() {
    this.isCoolingDown = true;
    this.millisecondsLeftUntilCooledDown = this.waypointCooldownMilliseconds;
  },
  createWaypoint: function( keysWorldLocation ) {
    this.playSound("waypointCreated");
    this.beginCooldown();
    var newWaypointElement = this.pullWaypointFromPool();
    this.incrementNumWaypoints();
    newWaypointElement.setAttribute( 'position', keysWorldLocation );
    newWaypointElement.className = 'waypoint';
    
    var keysWorldOrigin = document.querySelector('#keysWorldFloor').getAttribute('position');
    var foesWorldOrigin = document.querySelector('#foesWorldFloor').getAttribute('position');
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
    
    var newMirrorWaypointElement = this.pullWaypointFromPool();
    this.incrementNumWaypoints();
    newMirrorWaypointElement.setAttribute( 'position', foesWorldLocation );    
    newMirrorWaypointElement.className = 'waypoint';
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
        self.movePlayerToLocation( hitObjectLocation, activeAvatarEl );
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
            this.playSound("waypointCooledOff");
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
