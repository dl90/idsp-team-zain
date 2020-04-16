/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @note Scene 1
 */

const settings = {
  width: 2560,
  height: 2560,
  moveSpeed: 200,
  diagonalMoveSpeed: 141, // 141
  playerSpawnPosition: [96, 96],
  enemySpawnDistance: 1000,       // difficulty
  enemyMoveSpeed: 190,
  movementHealthCostRatio: 0.0001
}

class Scene_1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2 - 50,
      y: height / 2,
      text: 'Loading:',
      style: {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2 + 50,
      y: height / 2,
      text: '0%',
      style: {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        fontSize: '10px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading: ' + file.key);
    });

    this.load.on('complete', function () {
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    // background
    this.load.image('bg', './sprites/level_1/bg.png');
    this.load.spritesheet('f_dog', './sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('s_catcher', './sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_catcher', './sprites/catcher/l_sheet.png', { frameWidth: 128, frameHeight: 128 });

    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './bmg/1_Scene_1.mp3');

    // health bar
    this.load.image('health_100', './sprites/health-bar/health_100.png');
    this.load.image('health_90', './sprites/health-bar/health_90.png');
    this.load.image('health_85', './sprites/health-bar/health_85.png');
    this.load.image('health_80', './sprites/health-bar/health_80.png');
    this.load.image('health_70', './sprites/health-bar/health_70.png');
    this.load.image('health_65', './sprites/health-bar/health_65.png');
    this.load.image('health_55', './sprites/health-bar/health_55.png');
    this.load.image('health_50', './sprites/health-bar/health_50.png');
    this.load.image('health_45', './sprites/health-bar/health_45.png');
    this.load.image('health_40', './sprites/health-bar/health_40.png');
    this.load.image('health_30', './sprites/health-bar/health_30.png');
    this.load.image('health_20', './sprites/health-bar/health_20.png');
    this.load.image('health_15', './sprites/health-bar/health_15.png');
    this.load.image('health_10', './sprites/health-bar/health_10.png');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.cursors = this.input.keyboard.createCursorKeys();

    gameState.player = this.physics.add.sprite(settings.playerSpawnPosition[0], settings.playerSpawnPosition[1], 'f_dog').setScale(1);
    gameState.value = 0;
    gameState.player.setCollideWorldBounds(true);

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);

    // initialize health
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0);
    gameState.health = 100

    // audio department
    const sound_config = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }

    const sceneBGM = this.sound.add('scene_1_bgm', sound_config);
    const audioButton = this.add.sprite((width - 20), height - 20, 'audio_button_on').setScale(0.6).setScrollFactor(0);
    audioButton.setInteractive();

    const emitter = new Phaser.Events.EventEmitter();
    emitter.on('play_bmg', () => { sceneBGM.play() }, this);
    emitter.on('pause_bmg', () => {
      sceneBGM.pause();
      playing = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    emitter.on('resume_bmg', () => {
      sceneBGM.resume();
      playing = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)

    let playing = true;
    audioButton.on('pointerup', () => {
      if (playing) {
        emitter.emit('pause_bmg')
      } else {
        emitter.emit('resume_bmg')
      }
    });

    if (playing) {
      emitter.emit('play_bmg')
    }

    // this.enemies = game.add.group();
    // this.enemies.create(this.physics.add.sprite(300, 300, 'l_catcher'));
    // this.enemies.enableBody = true;

    this.enemy1 = this.physics.add.sprite(
      settings.playerSpawnPosition[0] + settings.enemySpawnDistance,
      settings.playerSpawnPosition[1] + settings.enemySpawnDistance,
      'l_catcher');
    this.enemy1.setCollideWorldBounds(true);

    this.enemy2 = this.physics.add.sprite(
      settings.playerSpawnPosition[0] + settings.enemySpawnDistance,
      settings.playerSpawnPosition[1] + settings.enemySpawnDistance,
      's_catcher');
    this.enemy2.setCollideWorldBounds(true);

    // camera department
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
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 2 }),
      frameRate: Math.round(settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({ //dogcatcher
      key: 'l_catcher',
      frames: this.anims.generateFrameNumbers('l_catcher', { start: 0, end: 3 }),
      frameRate: Math.round(settings.moveSpeed / 30),
      repeat: -1
    })
    this.anims.create({ //dogcatcher
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(settings.moveSpeed / 40),
      repeat: -1
    })
  }

  update() {
    this.enemy1.anims.play('l_catcher', true);
    this.enemy2.anims.play('s_catcher', true);

    this.physics.moveToObject(this.enemy1, gameState.player, 100);
    this.physics.moveToObject(this.enemy2, gameState.player, settings.enemyMoveSpeed);

    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('b_move', true);

      gameState.value += gameState.cursors.up.getDuration()   // ***
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('f_move', true);

      gameState.value += gameState.cursors.down.getDuration() // ***
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.left.getDuration() // ***
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.right.getDuration() // ***
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.up.getDuration()     // ***
      gameState.value += gameState.cursors.right.getDuration()  // ***
    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.up.getDuration()     // ***
      gameState.value += gameState.cursors.left.getDuration()   // ***
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.down.getDuration()     // ***
      gameState.value += gameState.cursors.right.getDuration()    // ***
    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      gameState.value += gameState.cursors.down.getDuration()     // ***
      gameState.value += gameState.cursors.left.getDuration()     // ***
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.setVelocityY(0);
      gameState.player.anims.pause()
      gameState.player.angle = 0;

      console.log(gameState.value * settings.movementHealthCostRatio);  // score
    }
  }
}