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
  roundPixels: true,
  antialias: false,
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
  // scene: [Menu, Level_transition, ScoreBoard, Scene_1, Scene_2, Scene_3],
  scene: [Scene_3],
  sceneKeys: ["Menu", "Level_transition", "ScoreBoard", "Scene_1", "Scene_2", "Scene_3"]
};

try {
  new Phaser.Game(config);
} catch (error) {
  console.log(error);
}
