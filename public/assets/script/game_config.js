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
  coinCount: 0 // @TODO change or implement to track
};

const config = {
  type: Phaser.CANVAS,
  width: 480,
  height: 270,
  parent: "game",
  backgroundColor: "e5e5e5",
  roundPixels: false,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
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
  scene: [Menu, Level_transition, Scene_select, Score_board, Scene_1, Scene_2, Scene_3, Scene_4, Scene_5, Scene_6, Scene_7, Scene_8, Scene_9, Scene_10, Scene_11, Scene_bonus],
  sceneKeys: ["Scene_1", "Scene_2", "Scene_3", "Scene_4", "Scene_5", "Scene_6", "Scene_7", "Scene_8", "Scene_9", "Scene_10", "Scene_11", "Scene_bonus"],

  // scene: [Scene_2]
};

try {
  new Phaser.Game(config);
} catch (error) {
  console.log(error);
}
