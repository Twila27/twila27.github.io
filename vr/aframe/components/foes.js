AFRAME.registerComponent( 'foe', {
  schema: {
    nodePositions: { default : "",
                     parse : function(value) {
                       if ( value == "" )
                         return "";
                       
                       value = value.replace(/ |\r?\n|\r/g, ''); //Remove all spaces/newlines.
                       value = value.replace(/{/g, '[');
                       value = value.replace(/}/g, ']'); //To eval as array.

                       var regexp = /\[\-?.,\-?.,\-?.\]/g; // \-? allows 0 or 1 escaped hyphens.
                       var result = value.match(regexp);
                       
                       var positions = []; //Array of vec3, but we have to make the vec3's.
                       
                       for ( var i = 0; i < result.length; i++ )
                       {
                         var arrayString = result[i];
                         var currentPositionArray = JSON.parse( arrayString );
                         positions.push( {
                          x: currentPositionArray[0],
                          y: currentPositionArray[1],
                          z: currentPositionArray[2]
                         } );
                       }
                        
                       console.log(positions);
                       return positions;
                     } 
                   },
    numNodes: { default: 3 },
    numLives: { default: -1 },
    dieSFX: { type: 'string' },
    nodeGazeTimeMilliseconds: { default: 0.0 },
    nodePopSFX: { type: 'string' }
  },
  getRandomPosition: function( maxX, maxY, maxZ ) {
    var position = { x:0, y:0, z:0 };
    position.x = Math.floor( ( Math.random() * 2*maxX ) - maxX );
    position.y = Math.floor( ( Math.random() * 2*maxY ) - maxY );
    position.z = Math.floor( ( Math.random() * 2*maxZ ) - maxZ );
    return position;
  },
  spawnNode: function( self, nodePosition ) {
    var newCombatNodeElement = document.createElement('a-entity');
    //var newCombatNodeElement = self.el.sceneEl.components.pool__combatNodes.requestEntity();

    newCombatNodeElement.setAttribute( 'combat-node', { 
      positionOffset:nodePosition,
      popSFX:self.data.nodePopSFX,
      gazeTimeMilliseconds: this.data.nodeGazeTimeMilliseconds
    } );
    
    self.el.appendChild( newCombatNodeElement );    
  },
  spawnNodes: function( self ) {
    var isSpawningRandomly = ( this.nodePositions.length === undefined ) || ( this.nodePositions.length === 0 );
    
    if ( !isSpawningRandomly )
    {
      var numPositions = self.nodePositions.length;
      
      for ( i = 1; i <= numPositions; i++ )
       self.spawnNode( self, self.nodePositions[i] ); 

      this.numNodesLeft = numPositions; //i.e. # left for the player to face.
    }
    else
    {
      var maxNodeDistFromFoe = 2;
      for ( i = 1; i <= self.data.numNodes; i++ )
      {
        var randomPosition = self.getRandomPosition( maxNodeDistFromFoe, maxNodeDistFromFoe, maxNodeDistFromFoe );
        self.spawnNode( self, randomPosition );
      }
      
      this.numNodesLeft = this.data.numNodes; //i.e. # left for the player to face.
    }    
  },
  checkForDeath: function( self ) {
    if ( ( this.numLivesLeft != 0 ) && ( this.isAlive == false ) )
    {      
      this.die( this.el );
      
      if ( this.numLivesLeft != 0 )
      {
        --this.numLivesLeft;
        this.spawnNodes( this );
        this.isAlive = true; //Start next life!   
      }
    }    
  },
  checkForStart: function( self ) {
    if ( self.isAlive == true ) //Can finally call spawnNodes below.
    {
      self.spawnNodes( self ); //Can't just call in init, because the pool runs init pre-spawn!
      self.functionToTick = self.checkForDeath;
    }
  },
  init: function() {
    this.el.setAttribute( 'sound__die', 'src', this.data.dieSFX );

    this.nodePositions = this.data.nodePositions;
    this.numLivesLeft = this.data.numLives;
    this.isAlive = true;
    
    this.functionToTick = this.checkForStart;
  },
  onAllNodesPopped: function() {

    //Foe defeated logic here.
    console.log("Foe defeated!");
    if ( this.numLivesLeft > 0 )
      --this.numLivesLeft;
    
    this.el.setAttribute( 'text', 'opacity', this.numLivesLeft / this.data.numLives );
    
    this.isAlive = false;
    this.el.components.sound__die.playSound();
    
    this.el.sceneEl.components.pool__foes.returnEntity( this.el );
  },
  onNodePopped: function( poppedNodeEl ) {
    --this.numNodesLeft;
    if ( this.numNodesLeft == 0 )
      this.onAllNodesPopped();
  },
  die: function( entityEl ) {
      entityEl.setAttribute( 'text', 'value', "Oh no!\nI am dying!" );
      entityEl.setAttribute( 'text', 'color', "gray" );
      var children = entityEl.object3D.children;
      for ( i = 1; i < children.length; i++ )
      {
        var childEl = children[i].el;           
        if ( childEl != this.el )
        {
         childEl.removeAttribute( 'combat-node' ); //Stop it from ticking, else it'll crash on removal.
         this.el.removeChild( childEl ); //Actually toss the combat-node. 
         //entityEl.sceneEl.components.pool__combatNodes.returnEntity();
        }
      }
  },
  tick: function() {
    this.functionToTick( this );
  },
  remove: function() {
   this.el.components.sound__die.stopSound();
   this.el.removeAttribute( 'sound__die' );
  }
} );


//Goal: can pop a single node.
AFRAME.registerComponent( 'combat-node', {
  multiple: true, //Can have more than one instance of combat-node component on an entity.
  schema: {
    positionOffset: { default: {x:0, y:0, z:0} },
    gazeTimeMilliseconds: { default: 0.0 },
    popSFX: { type: 'string' }
  },
  popNode: function( self ) { 
    self.el.parentNode
    self.el.parentNode.components.foe.onNodePopped(self.el);
    this.el.components.sound__pop.playSound();
  },
  init: function() {
    this.data.isPopping = false;
    this.el.setAttribute( 'geometry', { primitive: 'sphere', radius:1 } );
    this.initialColor = this.el.sceneEl.components.samsara_global.getRandomColor();
    this.el.setAttribute( 'material', 'color', this.initialColor );
    this.el.setAttribute( 'position', this.data.positionOffset );

    this.el.setAttribute( 'sound__pop', 'src', this.data.popSFX );
    this.millisecondsLeftUntilPop = this.data.gazeTimeMilliseconds;
    this.hasPopped = false;
    this.deadColor = 'gray';

    var _self = this; //Else we can't reference the component.data in handlers below.
    this.el.addEventListener( 'mouseenter', function() { _self.data.isPopping = true; } );
    this.el.addEventListener( 'mouseleave', function() { _self.data.isPopping = false; } );
  },
  updateOpacity: function ( self ) {
    const MIN_OPACITY = 0.25;
    var newOpacity = 1.0;
    var initialHealth = self.data.gazeTimeMilliseconds;
    
    if ( initialHealth == 0.0 )
    {
      newOpacity = MIN_OPACITY;
    }
    else
    {
      var quotient = self.millisecondsLeftUntilPop / initialHealth;
      newOpacity = ( quotient > MIN_OPACITY ) ? quotient : MIN_OPACITY;
    }
    self.el.setAttribute( 'material', 'opacity', newOpacity );
  },
  tick: function(time, timeDelta) {
    if ( this.data.isPopping )
    {
      this.updateOpacity( this );        
      if ( this.millisecondsLeftUntilPop > 0.0 )
      {
        //Start the getting-hurt particles.
        this.el.setAttribute( 'material', 'color', 'red' );
        this.millisecondsLeftUntilPop -= timeDelta; 
      }
      else if ( !this.hasPopped ) 
      {
        //Crazy-augment the hurt particles.
        this.hasPopped = true;
        this.popNode( this ); 
        this.el.setAttribute( 'material', 'color', this.deadColor );
      }
    }
    else
    {
      //Stop the getting-hurt particles.
      var inactiveColor = ( this.hasPopped ? this.deadColor : this.initialColor );
      this.el.setAttribute( 'material', 'color', inactiveColor );
    }
  },
  remove: function() {
   this.el.components.sound__pop.stopSound();
   this.el.removeAttribute( 'sound__pop' );
  }
} );
