  AFRAME.registerComponent( 'color-party', {
  
  init: function() { this.msSinceLastColorChange = 0.0; }
  ,
  tick: function(time, deltaTime) {
    this.msSinceLastColorChange += deltaTime;
    if ( this.msSinceLastColorChange > 500.0 )
    {
      this.el.setAttribute( 'color', this.getRandomColor() );
      this.msSinceLastColorChange = 0.0; 
    }
  }
  ,
  getRandomColor: function() { //Concatenate 0 to F six times.
      var colorStr = '#';
      var letters = '0123456789ABCDEF';
      for ( var strIndex = 0; strIndex < 6; strIndex++ ) {
        var pickedLetterIndex = Math.floor( Math.random() * 16 );
        colorStr += letters[ pickedLetterIndex ];
      }
      return colorStr; 
    }
                           
  });
