'use strict';

var tunnel = require('../elements/tunnel');


function Play() {}

Play.prototype = {
  preload: function () {
    this.game.load.image('veinyWalls', 'assets/veinyWalls.jpg');
  },

  create: function() {
    this.cameraS = 0.0;
    this.createTunnel();
  },

  createTunnel: function () {
    var width = this.game.width;
    var height = this.game.height;
    this.wallImage = this.game.add.sprite(0, 0, 'veinyWalls');
    this.wallImage.width = width;
    this.wallImage.height = height;
    this.tunnelFilter = new tunnel.TunnelFilter(this.game)
    this.tunnelFilter.init(width, height, this.wallImage.texture);
    this.wallImage.filters = [this.tunnelFilter];
  },

  updateTunnel: function (dt) {
    this.tunnelFilter.cameraS = this.cameraS;
    this.tunnelFilter.update();
  },

  update: function() {
    var dt = this.game.time.physicsElapsed;
    this.cameraS += dt;
    this.updateTunnel(dt);
  }
};

module.exports = Play;
