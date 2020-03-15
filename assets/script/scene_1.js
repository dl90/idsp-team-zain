const settings = {
  width: 2560,
  height: 2560,
  moveSpeed: 500,
  playerSpawnPosition: [64, 64],
  enemySpawnDistance: 500, // difficulty
  enemyMoveSpeed: 450 // difficulty
}

class Scene_1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1' });
  }

  preload() {
    this.load.image('bg', './images/level_1/bg.png'); // 2560*2560
    this.load.spritesheet('f_dog', './images/dog/f_sheet.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('b_dog', './images/dog/b_sheet.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('l_dog', './images/dog/l_sheet.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('l_catcher', './images/catcher/l_sheet.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(settings.playerSpawnPosition[0], settings.playerSpawnPosition[1], 'f_dog').setScale(1);
    gameState.player.setCollideWorldBounds(true);

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);

    // this.enemies = game.add.group();
    // this.enemies.create(this.physics.add.sprite(300, 300, 'l_catcher'));
    // this.enemies.enableBody = true;

    this.enemy = this.physics.add.sprite(
      settings.playerSpawnPosition[0] + settings.enemySpawnDistance,
      settings.playerSpawnPosition[1] + settings.enemySpawnDistance,
      'l_catcher');
    this.enemy.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, settings.width, settings.height);
    this.physics.world.setBounds(0, 0, settings.width, settings.height);
    this.cameras.main.startFollow(gameState.player);

    this.animate();
  }

  animate() {
    this.anims.create({
      key: 'f_move',
      frames: this.anims.generateFrameNumbers('f_dog', { start: 0, end: 2 }),
      frameRate: Math.round(settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: Math.round(settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'l_move',
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 4 }),
      frameRate: Math.round(settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({ //dogcatcher
      key: 'l_catcher',
      frames: this.anims.generateFrameNumbers('l_catcher', { start: 0, end: 3 }),
      frameRate: Math.round(settings.moveSpeed / 30),
      repeat: -1
    })
  }

  update() {
    this.enemy.anims.play('l_catcher', true);
    this.physics.moveToObject(this.enemy, gameState.player, settings.enemyMoveSpeed);

    if (gameState.cursors.up.isDown) { // controls
      gameState.player.setVelocityY(-settings.moveSpeed);
      gameState.player.anims.play('b_move', true);
    } else if (gameState.cursors.down.isDown) {
      gameState.player.setVelocityY(settings.moveSpeed);
      gameState.player.anims.play('f_move', true);
    } else if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-settings.moveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
    } else if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(settings.moveSpeed);
      gameState.player.anims.play('l_move', true);
      gameState.player.flipX = true;
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.setVelocityY(0);
      gameState.player.anims.pause()
    }
  }
}