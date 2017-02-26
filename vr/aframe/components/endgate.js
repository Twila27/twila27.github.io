AFRAME.registerComponent( 'endgate', {
  init: function() {
    this.el.setAttribute( 'animation', {
      property: 'rotation',
      loop: true,
      dur: 5000,
      easing: 'linear',
      to: '0 360 0'
    });
  }
});
