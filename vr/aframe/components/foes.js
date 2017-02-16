AFRAME.registerComponent( 'foe', {
  schema: {
    numNodes: { default: 1 },
    numLives: { default: -1 },
    dieSFX: { type: 'string' },
    nodeGazeTimeMilliseconds: { default: 0.0 },
    nodePopSFX: { type: 'string' }
  },
  spawnNodes: function( self ) {
    for ( i = 1; i <= self.data.numNodes; i++ )
    {
      //var newCombatNodeElement = document.createElement('a-entity');
      var newCombatNodeElement = self.el.sceneEl.components.pool__combatNodes.requestEntity();
      
      var position = { x:0, y:2*i, z:0 };
      var maxNodeX = 4;
      var maxNodeY = 4;
      var maxNodeZ = 4;
      position.x = Math.floor( ( Math.random() * 2*maxNodeX ) - maxNodeX );
      position.y = Math.floor( ( Math.random() * 2*maxNodeY ) - maxNodeY );
      position.z = Math.floor( ( Math.random() * maxNodeZ ) - maxNodeZ ); //Only in one dimension.
      newCombatNodeElement.setAttribute( 'combat-node', { 
        positionOffset:position, 
        popSFX:self.data.nodePopSFX,
        gazeTimeMilliseconds: this.data.nodeGazeTimeMilliseconds
      } );
      self.el.appendChild( newCombatNodeElement );
    }
    this.numNodesLeft = self.data.numNodes;
  },
  init: function() {
    this.el.setAttribute( 'sound__die', 'src', this.data.dieSFX );

    this.numNodesLeft = this.data.numNodes;
    this.numLivesLeft = this.data.numLives;

//    this.spawnNodes( this ); //!\\
},
  onAllNodesPopped: function() {
    //Foe defeated logic here.
    console.log("Foe defeated!");
    if ( this.numLivesLeft > 0 )
      --this.numLivesLeft;
    
    this.isAlive = false;
    this.el.components.sound__die.playSound();
  },
  onNodePopped: function(poppedNodeEl) {
    console.log("Parent received pop!");
    --this.numNodesLeft;
    if ( this.numNodesLeft == 0 )
      this.onAllNodesPopped();
  },
  die: function( entityEl ) {
      entityEl.setAttribute( 'text', 'value', "Oh no!\nI am dead!" );
      entityEl.setAttribute( 'text', 'color', "gray" );
      var children = entityEl.object3D.children;
      for ( i = 1; i < children.length; i++ )
      {
        var childEl = children[i].el;           
        if ( childEl != this.el )
        {
          childEl.removeAttribute( 'combat-node' ); //Stop it from ticking, else it'll crash on removal.
          //this.el.removeChild( childEl ); //Actually toss the combat-node. 
          entityEl.sceneEl.components.pool__combatNodes.returnEntity();
        }
      }
  },
  tick: function() {
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
  getRandomColor: function() { //Concatenate 0 to F six times.
    var colorStr = '#';
    var letters = '0123456789ABCDEF';
    for ( var strIndex = 0; strIndex < 6; strIndex++ ) {
      var pickedLetterIndex = Math.floor( Math.random() * 16 );
      colorStr += letters[ pickedLetterIndex ];
    }
    return colorStr; 
  },
  popNode: function( self ) { 
    self.el.parentNode.components.foe.onNodePopped(self.el);
    this.el.components.sound__pop.playSound();
  },
  init: function() {
    this.data.isPopping = false;
    this.el.setAttribute( 'geometry', { primitive: 'sphere', width:4, height:1 } );
    this.initialColor = this.getRandomColor();
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
  tick: function(time, timeDelta) {
    if ( this.data.isPopping )
    {
      if ( this.millisecondsLeftUntilPop > 0.0 )
      {
        this.el.setAttribute( 'material', 'color', 'red' );
        this.millisecondsLeftUntilPop -= timeDelta; 
      }
      else if ( !this.hasPopped ) 
      {
        this.hasPopped = true;
        this.popNode( this ); 
        this.el.setAttribute( 'material', 'color', this.deadColor );
      }
    }
    else
    {
      var inactiveColor = ( this.hasPopped ? this.deadColor : this.initialColor );
      this.el.setAttribute( 'material', 'color', inactiveColor );
    }
  },
  remove: function() {
   this.el.components.sound__pop.stopSound();
   this.el.removeAttribute( 'sound__pop' );
  }
} );
