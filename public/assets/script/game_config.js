'use strict';
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 */

const gameState = {
  uid: null,
  userDisplayName: null,
  score: null,
  bonusScore: 0,
  coinCount: 0
};

const config = {
  type: Phaser.CANVAS,
  width: 480,
  height: 270,
  parent: "game",
  backgroundColor: "e5e5e5",
  roundPixels: true,
  antialias: false,
  // resolution: window.devicePixelRatio,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
      enableBody: true,
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
  },
  render: {
    pixelArt: true
  },
  scene: [Menu, Scene_1, Scene_1_end, Scene_2, ScoreBoard]
  // scene: [Scene_2]
};

try {
  new Phaser.Game(config);
} catch (error) {
  console.log(error)
}
