// phaser basics

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 1000,
  backgroundColor: "#5f2a55",
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config)

// stores game state object
const gameState = {};

function preload() {
  // sprite asset
  this.load.image('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/codey.png');
  this.load.audio('incredible', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/incredible.mp3');
  this.load.audio('awesome', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/reallyawesome.mp3');
};

function create() {

  // sprite
  gameState.codey = this.add.sprite(150, 200, 'codey');

  // movement
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // sound
  gameState.incredible = this.sound.add('incredible');
  gameState.awesome = this.sound.add('awesome');

  // box objects
  gameState.incredibleBox = this.add.rectangle(200, 150, 300, 200, 0xdadaaa);
  gameState.awesomeBox = this.add.rectangle(200, 400, 300, 200, 0xaadada)
  gameState.incredibleText = this.add.text(150, 135, "Incredible", { fill: "#222222", font: "20px Times New Roman" });
  gameState.awesomeText = this.add.text(110, 385, "Really, really awesome", { fill: "#222222", font: "20px Times New Roman" });

  // adds interaction
  gameState.incredibleBox.setInteractive();
  gameState.awesomeBox.setInteractive();
};

function update() {

  // movement
  if (gameState.cursors.right.isDown) {
    gameState.codey.x += 5;
  };
  if (gameState.cursors.left.isDown) {
    gameState.codey.x -= 5;
  };
  if (gameState.cursors.up.isDown) {
    gameState.codey.y -= 5;
  };
  if (gameState.cursors.down.isDown) {
    gameState.codey.y += 5;
  };

  // audio trigger
  gameState.incredibleBox.on('pointerup', function () {
    gameState.incredible.play();
  });
  gameState.awesomeBox.on('pointerup', function () {
    gameState.awesome.play();
  });

};
