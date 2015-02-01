
'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    this.titleText = this.game.add.text(
      this.game.world.centerX, 300,
      'Tunnel Runner',
      { font: '65px Arial', fill: '#ffffff', align: 'center'});
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(
      this.game.world.centerX, 400,
      'Click to start',
      { font: '16px Arial', fill: '#ffffff', align: 'center'}
    );
    this.instructionsText.anchor.setTo(0.5, 0.5);

  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;
