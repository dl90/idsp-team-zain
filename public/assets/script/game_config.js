'use strict';
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 */

const gameState = {
  userID: null,
  userDisplayName: null,
  score: null
};

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  parent: "game",
  backgroundColor: "e5e5e5",
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
  render: { pixelArt: true },
  scene: [Menu, Scene_1, Scene_1_end, Scene_2]
};

try {
  new Phaser.Game(config);
} catch (error) {
  console.log(error)
}