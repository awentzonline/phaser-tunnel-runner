(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
* Original shader by 4rknova (https://www.shadertoy.com/view/lssGDn)
* Tweaked, uniforms added and converted to Phaser/PIXI by Richard Davey
*/
var TunnelFilter = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.cameraS = { type: '1f', value: 0.0 };
    this.uniforms.alpha = { type: '1f', value: 1.0 };
    this.uniforms.origin = { type: '1f', value: 2.0 };
    this.uniforms.iChannel0 = { type: 'sampler2D', value: null, textureData: { repeat: true } };

    this.fragmentSrc = [

        "precision mediump float;",
        "uniform vec2      resolution;",
        "uniform float     cameraS;",
        "uniform sampler2D iChannel0;",
        "uniform float     alpha;",
        "uniform float     origin;",

        "#define S 0.79577471545 // Precalculated 2.5 / PI",
        "#define E 0.0001",

        "void main(void)",
        "{",
            "vec2 p = (origin * gl_FragCoord.xy / resolution.xy - 1.0) * vec2(resolution.x / resolution.y, 1.0);",
            "vec2 t = vec2(S * atan(p.x, p.y), 1.0 / max(length(p), E));",
            "vec3 c = texture2D(iChannel0, t + vec2(cameraS * 0.1, cameraS)).xyz;",
            "gl_FragColor = vec4(c / (t.y + 0.5), alpha);",
        "}"

    ];

};

TunnelFilter.prototype = Object.create(Phaser.Filter.prototype);
TunnelFilter.prototype.constructor = TunnelFilter;

TunnelFilter.prototype.init = function (width, height, texture) {

    this.setResolution(width, height);
    this.uniforms.iChannel0.value = texture;

    texture.baseTexture._powerOf2 = true;

};

Object.defineProperty(TunnelFilter.prototype, 'cameraS', {
    // View displacement along path
    get: function() {
        return this.uniforms.cameraS.value;
    },

    set: function(value) {
        this.uniforms.cameraS.value = value;
    }
});

Object.defineProperty(TunnelFilter.prototype, 'alpha', {

    get: function() {
        return this.uniforms.alpha.value;
    },

    set: function(value) {
        this.uniforms.alpha.value = value;
    }

});

Object.defineProperty(TunnelFilter.prototype, 'origin', {

    get: function() {
        return this.uniforms.origin.value;
    },

    set: function(value) {
        this.uniforms.origin.value = value;
    }

});


module.exports.TunnelFilter = TunnelFilter;

},{}],2:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'base-game');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":3,"./states/gameover":4,"./states/menu":5,"./states/play":6,"./states/preload":7}],3:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],4:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){
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

},{"../elements/tunnel":1}],7:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('veinyWalls', 'assets/veinyWalls.png');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[2])