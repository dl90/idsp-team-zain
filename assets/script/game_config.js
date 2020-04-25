'use strict'
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 */

const gameState = {};
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: "e5e5e5",
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
      enableBody: true,
    }
  },
  scene: [Menu, Scene_1, Scene_1_end, Scene_2]
};

try {
  new Phaser.Game(config);
} catch (error) {
  console.log(error)
}
