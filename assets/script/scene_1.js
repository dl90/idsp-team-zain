/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const settings = {
  width: 2560,
  height: 2560,
  moveSpeed: 300,
  playerSpawnPosition: [32, 32],
  enemySpawnDistance: 500, // difficulty
  enemyMoveSpeed: 220 // difficulty
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

    this.load.image('bg', './sprites/level_1/bg.png'); // 2560*2560
    this.load.spritesheet('f_dog', './sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('s_catcher', './sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_catcher', './sprites/catcher/l_sheet.png', { frameWidth: 128, frameHeight: 128 });

    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './bmg/1_Scene_1.mp3');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(settings.playerSpawnPosition[0], settings.playerSpawnPosition[1], 'f_dog').setScale(1);
    gameState.player.setCollideWorldBounds(true);

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);

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
    const audioButton = this.add.sprite((width - 20), height - 20, 'audio_button_on').setScale(0.6);
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
      frameRate: Math.round(settings.moveSpeed / 30),
      repeat: -1
    })
  }

  update() {
    this.enemy1.anims.play('l_catcher', true);
    this.enemy2.anims.play('s_catcher', true);

    this.physics.moveToObject(this.enemy1, gameState.player, 100);
    this.physics.moveToObject(this.enemy2, gameState.player, settings.enemyMoveSpeed);

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