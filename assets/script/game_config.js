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
      gravity: { y: 200 },
      enableBody: true,
    }
  },
  scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);
