AFRAME.registerComponent( 'foe', {
  schema: {
    numNodes: { default: 1 },
    dieSFX: { type: 'string' },
    nodePopSFX: { type: 'string' }
  },
  init: function() {
    this.el.setAttribute( 'sound__die', 'src', this.data.dieSFX );

    this.numNodes = this.data.numNodes;
    for ( i = 1; i <= this.numNodes; i++ )
    {
      var newCombatNodeElement = document.createElement('a-entity');
      var position = { x:0, y:2*i, z:0 };
      var maxNodeX = 4;
      var maxNodeY = 4;
      var maxNodeZ = 4;
      position.x = Math.floor( ( Math.random() * 2*maxNodeX ) - maxNodeX );
      position.y = Math.floor( ( Math.random() * 2*maxNodeY ) - maxNodeY );
      position.z = Math.floor( ( Math.random() * maxNodeZ ) - maxNodeZ ); //Only in one dimension.
      newCombatNodeElement.setAttribute( 'combat-node', { positionOffset:position, popSFX:this.data.nodePopSFX } );
      this.el.appendChild( newCombatNodeElement );
    }
  },
  onAllNodesPopped: function() {
    //Foe defeated logic here.
    console.log("Foe defeated!");
    this.isAlive = false;
    this.el.components.sound__die.playSound();
  },
  onNodePopped: function(poppedNodeEl) {
    console.log("Parent received pop!");
    --this.numNodes;
    if ( this.numNodes == 0 )
      this.onAllNodesPopped();
  },
  tick: function() {
    if ( this.onlyOnce == undefined && this.isAlive == false )
    {
      this.onlyOnce = true; //Ideally get rid of this by using remove(), but need to figure out .removeChild crashing first!
      this.el.setAttribute( 'text', 'value', "Oh no!\nI am dead!" );
      this.el.setAttribute( 'text', 'color', "gray" );
      var children = this.el.object3D.children;
      for ( i = 1; i < children.length; i++ )
      {
        var child = children[i].el;
        if ( child == this.el )
          continue; //Why does the group children include this itself?
        
        child.removeAttribute( 'combat-node' ); //Stop it from ticking, else it'll crash on removal.
      }
    }
  }
} );


//Goal: can pop a single node.
AFRAME.registerComponent( 'combat-node', {
  multiple: true, //Can have more than one instance of combat-node component on an entity.
  schema: {
    positionOffset: { default: {x:0, y:0, z:0} },
    gazeTimeSeconds: { default: 0.0 },
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
    this.secondsLeftUntilPop = this.data.gazeTimeSeconds;
    this.hasPopped = false;
    this.deadColor = 'gray';

    var _self = this; //Else we can't reference the component.data in handlers below.
    this.el.addEventListener( 'mouseenter', function() { _self.data.isPopping = true; } );
    this.el.addEventListener( 'mouseleave', function() { _self.data.isPopping = false; } );
  },
  tick: function(time, timeDelta) {
    if ( this.data.isPopping )
    {
      if ( this.secondsLeftUntilPop > 0.0 )
      {
        this.el.setAttribute( 'material', 'color', 'red' );
        this.secondsLeftUntilPop -= this.data.gazeTimeSeconds; 
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
   this.el.parentNode.removeChild( this.el ); //Actually toss the combat-node.
  }
} );
