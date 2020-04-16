/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @note Game Global Config
 */

const gameState = {
  health: null,
  score: 0
};

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: "e5e5e5",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      enableBody: true,
    }
  },
  scene: [Menu, Scene_1]
};

try {
  const game = new Phaser.Game(config);
} catch (error) {
  console.log(error)
}
