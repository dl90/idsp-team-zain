/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @note Scene 1
 */

const settings = {
  width: 3200,
  height: 3200,
  moveSpeed: 100,
  diagonalMoveSpeed: 70.71, // 141
  playerSpawnPosition: [80, 80],
  enemyMoveSpeed: 90,
  movementHealthCostRatio: 0.000005
}

const sceneState = {}

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
    this.load.image('bg', './sprites/testing/100x100.png');
    this.load.spritesheet('f_dog', './sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('s_catcher', './sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './bgm/1_Scene_1.mp3');
    this.load.audio('success_audio', 'bgm/clips/Success.mp3');
    this.load.audio('danger_audio', 'bgm/clips/Hero_In_Peril.mp3');
    this.load.audio('death_audio', 'bgm/clips/First_Call.mp3');

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

    // endpoint
    this.load.image('girl_1', './sprites/family/girl_1.png');
  }

  create() {
    this.scene.remove("Menu");

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);//.setScale(0.25);


    // level title
    sceneState.levelText = this.add.text(width / 2 - 50, height / 2 - 50, 'Level 1', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
    this.time.delayedCall(5000, removeLevelText);
    function removeLevelText() {
      sceneState.levelText.destroy();
    }

    gameState.cursors = this.input.keyboard.createCursorKeys();

    gameState.player = this.physics.add.sprite(settings.playerSpawnPosition[0], settings.playerSpawnPosition[1], 'f_dog').setScale(1);
    gameState.value = 0;
    gameState.player.setCollideWorldBounds(true);


    // scene transition
    gameState.girl_1 = this.physics.add.sprite(settings.width - 16, settings.height - 16, "girl_1").setScale(0.25)
    this.physics.add.overlap(gameState.player, gameState.girl_1, () => {
      sceneBGM.stop()
      sceneBGM.destroy()
      this.sound.play('success_audio')
      this.scene.stop("Scene_1")
      this.scene.start("Scene_2")
    })


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

    const dangerBGM = this.sound.add('danger_audio', sound_config);
    const deathBGM = this.sound.add('death_audio', sound_config.loop = false)


    let audioPlaying = true;
    let danger = false;

    // emitter for music
    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.on('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      sceneBGM.pause()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    gameState.emitter.on('resume_bgm', () => {
      sceneBGM.resume();
      audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)
    // gameState.emitter.on('danger_bgm_play', () => {
    //   if (!danger) {
    //      dangerBGM.play()
    //     danger = true
    //   }
    // gameState.emitter.on('danger_bgm_stop', () => {
    //   danger = false
    // })
    // }, this)
    gameState.emitter.on('death_bgm', () => {
      sceneBGM.pause()
      deathBGM.play()
    }, this)


    // dangerBGM.once('complete', () => {
    //   sceneBGM.resume()
    // })

    audioButton.on('pointerup', () => {
      if (audioPlaying) {
        gameState.emitter.emit('pause_bgm')
      } else {
        gameState.emitter.emit('resume_bgm')
      }
    });
    gameState.emitter.emit('play_bgm')


    // this.enemies = game.add.group();
    // this.enemies.create(this.physics.add.sprite(300, 300, 'l_catcher'));
    // this.enemies.enableBody = true;


    this.enemy2 = this.physics.add.sprite(320, 320, 's_catcher');
    this.enemy2.setCollideWorldBounds(true);


    this.enemy3 = this.physics.add.sprite(256, 256, 's_catcher');
    this.enemy3.setCollideWorldBounds(true);


    this.physics.add.overlap(gameState.player, this.enemy2, () => {
      gameState.health -= 20
    })

    this.physics.add.overlap(gameState.player, this.enemy3, () => {
      gameState.health -= 20
    })

    // collider physics
    // this.physics.add.collider(gameState.player, this.enemy2);

    gameState.player.debugShowBody = true;
    gameState.player.debugShowVelocity = true;
    // gameState.player.setBounce(10, 10)

    //tween
    this.tweenEnemy2 = this.tweens.add({
      targets: this.enemy2,
      x: -50,
      ease: 'Linear',
      duration: 1500,
      repeat: -1,
      yoyo: true,
    })

    this.tweenEnemy3 = this.tweens.add({
      targets: this.enemy3,
      y: -50,
      ease: 'Linear',
      duration: 1500,
      repeat: -1,
      yoyo: true,
    })


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
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(settings.moveSpeed / 40),
      repeat: -1
    })
  }

  update() {
    // this.enemy1.anims.play('l_catcher', true);
    this.enemy2.anims.play('s_catcher', true);
    this.enemy3.anims.play('s_catcher', true);

    // this.physics.moveToObject(this.enemy1, gameState.player, 60);
    function distanceCalc(gameObj1, gameObj2) {
      return Phaser.Math.Distance.Chebyshev(gameObj1.x, gameObj1.y, gameObj2.x, gameObj2.y)
    }

    let dangerState = false
    if (distanceCalc(gameState.player, this.enemy3) < 80) {
      this.tweenEnemy3.pause();
      this.physics.moveToObject(this.enemy3, gameState.player, settings.enemyMoveSpeed - 0);
      dangerState = true
    }
    if ((Math.abs(this.enemy2.x - gameState.player.x) < 30) && (Math.abs(this.enemy2.y - gameState.player.y) < 30)) {
      this.tweenEnemy2.pause();
      this.physics.moveToObject(this.enemy2, gameState.player, settings.enemyMoveSpeed - 0);
      dangerState = true
    }

    // if(dangerState && gameState.health > 0) {
    //   gameState.emitter.emit('pause_bgm')
    //   gameState.emitter.emit('danger_bgm_play')
    // } else {
    //   gameState.emitter.emit('danger_bgm_stop')
    //   gameState.emitter.emit('resume_bgm')
    // }

    // controls
    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('b_move', true);

      if (gameState.health > 0) {
        gameState.health -= (gameState.cursors.up.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('f_move', true);

      if (gameState.health > 0) {
        gameState.health -= (gameState.cursors.down.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (gameState.cursors.left.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (gameState.cursors.right.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (0.6 * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (0.6 * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (0.6 * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.health > 0) {
        gameState.health -= (0.6 * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.health = -1
      }
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.setVelocityY(0);
      gameState.player.anims.pause()
      gameState.player.angle = 0;

    }

    // health department
    if (gameState.health >= 0) {
      const healthTickers = {
        100: () => { gameState.healthBar.setTexture('health_100') },
        93: () => { gameState.healthBar.setTexture('health_90') },
        86: () => { gameState.healthBar.setTexture('health_85') },
        79: () => { gameState.healthBar.setTexture('health_80') },
        72: () => { gameState.healthBar.setTexture('health_70') },
        65: () => { gameState.healthBar.setTexture('health_65') },
        58: () => { gameState.healthBar.setTexture('health_55') },
        51: () => { gameState.healthBar.setTexture('health_50') },
        44: () => { gameState.healthBar.setTexture('health_45') },
        38: () => { gameState.healthBar.setTexture('health_40') },
        31: () => { gameState.healthBar.setTexture('health_30') },
        24: () => { gameState.healthBar.setTexture('health_20') },
        17: () => { gameState.healthBar.setTexture('health_15') },
        10: () => { gameState.healthBar.setTexture('health_10') }
      }
      for (const bar in healthTickers) {
        if ((gameState.health - bar >= -2.5) && (gameState.health - bar <= 2.5)) {
          healthTickers[bar]()
        }
      }
    }

    if (gameState.health < 0) {
      sceneState.levelText = this.add.text(180, 100, 'Game Over', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
      this.scene.pause()
      gameState.emitter.emit('pause_bgm')
      // gameState.emitter.emit('danger_bgm_stop')
      gameState.emitter.emit('death_bgm')
    }

  }
}