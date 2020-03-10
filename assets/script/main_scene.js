class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    this.load.spritesheet('f_dog', './images/dog/f_sheet.png',  { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('b_dog', './images/dog/b_sheet.png',  { frameWidth: 256, frameHeight: 256 });
    this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
    this.load.image('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/codey.png');
  }

  create() {
    gameState.cursors = this.input.keyboard.createCursorKeys();

    gameState.player = this.physics.add.sprite(50, 50, 'f_dog').setScale(0.5);
    gameState.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'f_move',
      frames: this.anims.generateFrameNumbers('f_dog', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });



    const platforms = this.physics.add.staticGroup();
    // const bugs = this.physics.add.group();

    platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();
    gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });
  

    this.physics.add.collider(gameState.player, platforms);

    // const bugGen = () => {
    //   const xCoord = Math.random() * 640
    //   bugs.create(xCoord, 10, 'bug1')
    // }

    // const bugGenLoop = this.time.addEvent({
    //   delay: 1000,
    //   callback: bugGen,
    //   callbackScope: this,
    //   loop: true,
    // });

    // this.physics.add.collider(bugs, platforms, bug => {
    //   bug.destroy();
    //   gameState.score += 10;
    //   gameState.scoreText.setText(`Score: ${gameState.score}`);
    // })

    // this.physics.add.collider(gameState.player, bugs, () => {
    //   bugGenLoop.destroy();
    //   this.physics.pause();
    //   this.add.text(180, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
    //   this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });

    //   this.input.on('pointerup', () => {
    //     gameState.score = 0;
    //     this.scene.restart();
    //   });
    // });
  }

  update() {
    if (gameState.cursors.up.isDown) {
      gameState.player.setVelocityY(-160);
      gameState.player.anims.play('b_move', true);
    } else if (gameState.cursors.down.isDown) {
      gameState.player.setVelocityY(160);
      gameState.player.anims.play('f_move', true);
    } else if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-160);
      gameState.player.anims.pause()
    } else if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(160);
      gameState.player.anims.pause()
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.anims.pause()
    }
  }
}