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
  incrementNumWaypoints: function() {
    return this.el.sceneEl.components.samsara_global.incrementNumWaypoints();
  },
  movePlayerToLocation: function( worldSpaceLocation, activeAvatarEl ) {
    var avatarHeight = activeAvatarEl.getAttribute( 'position' ).y; //Preserving it, as worldSpaceLocation is at floor level.
    activeAvatarEl.setAttribute( 'position', { x:worldSpaceLocation.x, y:avatarHeight, z:worldSpaceLocation.z } );
  },
  pullWaypointFromPool: function() {
    //Come back and replace this with any necessary returnEntity(oldestWaypoint) calls.
    return this.el.sceneEl.components.pool__waypoints.requestEntity();
  },
  beginCooldown: function() {
    this.isCoolingDown = true;
    this.millisecondsLeftUntilCooledDown = this.waypointCooldownMilliseconds;
  },
  createWaypoint: function( location ) {
    this.playSound("waypointCreated");
    this.beginCooldown();
    var newWaypointElement = this.pullWaypointFromPool();
    this.incrementNumWaypoints();
    newWaypointElement.setAttribute( 'position', location );
    //TODO: Add logic to create the waypoint on the other floor next.
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

    if ( hitObjectClass === 'floor' )
    {
      var activeAvatarEl = self.getActiveAvatarEl();
      //if ( activeAvatarEl.id === 'keysWorldCamera' ) //Prevent foes world from adding waypoints.
      //{
        self.createWaypoint( hitObjectLocation );
        self.movePlayerToLocation( hitObjectLocation, activeAvatarEl );
      //}
    }
    else if ( hitObjectClass === 'waypoint' )
    {
      self.movePlayerToLocation( hitObjectLocation );
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
      
    this.name = "I am init run #" + numInits + ".";
    names.push( name );
    ++numInits;
      
    this.el.addEventListener( 'click', clickListener ); //Handle to listener for remove() below.
  },
  remove: function() { //So we remove listeners here to prevent pile-up.
    this.el.removeEventListener( 'click', clickListener );
  }
} );
