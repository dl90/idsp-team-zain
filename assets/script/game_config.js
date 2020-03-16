const gameState = {
  score: 0
};

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
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

const game = new Phaser.Game(config);
