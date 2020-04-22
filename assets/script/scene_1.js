/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @TODO fix danger audio queue, health bar responsiveness
 */

const sceneState = {}
const settings = {
  width: 3200,
  height: 3200,
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71, // calculated
  playerSpawnPosition: [80, 80],
  enemyMoveSpeed: 90,
  enemyChaseDistance: 80,
  twoKeyMultiplier: 0.6,
  tweenRate_easy: 6,
  tweenRate_medium: 12,
}

class Scene_1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    function loading() {
      const loadingText = this.make.text({
        x: width / 2 - 50,
        y: height / 2,
        text: 'Loading:',
        style: {
          fontSize: '24px',
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
          fill: '#000000'
        }
      });
      percentText.setOrigin(0.5, 0.5);

      const assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
          fontSize: '10px',
          // fontFamily: 'Arial',
          fill: '#000000'
        }
      });
      assetText.setOrigin(0.5, 0.5);

      this.load.on('progress', value => { percentText.setText(parseInt(value * 100) + '%') });
      this.load.on('fileprogress', file => { assetText.setText('Loading: ' + file.key) });
      this.load.on('complete', () => { loadingText.destroy(); percentText.destroy(); assetText.destroy() });
    }

    loading.apply(this);
    this.load.image('bg', './sprites/testing/100x100.png');
    this.load.spritesheet('f_dog', './sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('s_catcher', './sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './bgm/Meme_Scene_1.mp3');
    this.load.audio('success_audio', 'bgm/clips/Success.mp3');
    this.load.audio('danger_audio', 'bgm/clips/Hero_In_Peril.mp3');
    this.load.audio('death_audio', 'bgm/clips/Meme_death.mp3');

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

    // level 1 specifics
    this.load.image('girl_1', './sprites/family/girl_1.png');
    this.load.image('bone', './sprites/items/bone.png');
    this.load.image('fence_horizontal', './sprites/level_1/fence_horizontal.png');
    this.load.image('fence_vertical', './sprites/level_1/fence_vertical.png');
    this.load.image('bush_square', './sprites/level_1/bush_square.png');
    this.load.image('sign', './sprites/level_1/blue_sign.png');

  }

  create() {
    this.scene.remove("Menu");

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);//.setScale(0.25);

    // level title
    sceneState.levelText = this.add.text(width / 2 - 50, height / 2 - 50, 'Level 1', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
    this.time.delayedCall(5000, sceneState.levelText.destroy());


    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(settings.playerSpawnPosition[0], settings.playerSpawnPosition[1], 'f_dog').setScale(1).setDepth(10);
    gameState.player.setCollideWorldBounds(true);
    // gameState.player.setBounce(10, 10)

    // initialize health
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
    gameState.healthVal = 100

    // bone
    gameState.bone = this.physics.add.sprite(settings.width / 2, settings.height / 2, 'bone');
    this.physics.add.overlap(gameState.player, gameState.bone, () => {
      let cache = gameState.healthVal;
      (gameState.healthVal + 40) > 100 ? gameState.healthVal = 100 : gameState.healthVal += 40;
      gameState.bone.destroy();
      gameState.health(gameState.healthVal, cache);
    })

    // scene transition 
    gameState.girl_1 = this.physics.add.sprite(settings.width - 64, settings.height - 64, "girl_1").setScale(1).setOrigin(0.5).setSize(32, 32, 0, 0).setOffset(48, 48)
    this.physics.add.overlap(gameState.player, gameState.girl_1, () => {
      sceneBGM.stop()
      sceneBGM.destroy()
      this.sound.play('success_audio')
      this.scene.stop("Scene_1")
      this.scene.start("Scene_2")
    })

    // --- Static --- //

    // walls
    const walls = this.physics.add.staticGroup();
    const horizontalWalls = [{ x: 64, y: 128 }, { x: 192, y: 128 }, { x: 384, y: 128 }]; // batch creation
    horizontalWalls.forEach(wall => { walls.create(wall.x, wall.y + 16, 'fence_horizontal').setScale(1, 0.25).refreshBody().setOrigin(0.5) });

    const verticalWalls = [{ x: 512, y: 64 }, { x: 512, y: 128 }, { x: 512, y: 192 }, { x: 512, y: 256 }];
    verticalWalls.forEach(wall => { walls.create(wall.x + 16, wall.y, 'fence_vertical').setScale(0.25, 1).refreshBody().setOrigin(0.5) });
    this.physics.add.collider(gameState.player, walls);

    sceneState.sign = this.physics.add.sprite(128, 64, 'sign').setScale(0.25).setOrigin(0).setInteractive();
    // sceneState.sign.setSize(128,128,0,0).setOffset(0,0); // not necessary
    sceneState.sign.setDamping(true);
    sceneState.sign.setDrag(0.5);
    sceneState.sign.setMaxVelocity(200);
    this.physics.add.collider(gameState.player, sceneState.sign, () => {  // sceneState.sign.setState('moving')
      const str = 'Danger up ahead';
      gameState.message = this.add.text(width / 2 - 75, height * 0.9, str, { fontSize: 16, color: '#FF0B0F' }).setScrollFactor(0);
    });
    this.physics.add.collider(sceneState.sign, [this.enemy3, this.enemy2, walls]);

    const simiWalls = this.physics.add.staticGroup();
    const squareBushes = [{ x: 0, y: 160}, { x: 32, y: 160}, { x: 64, y: 160}, { x: 96, y: 160}, { x: 128, y: 160}, { x: 160, y: 160}, { x: 192, y: 160}];
    squareBushes.forEach(bush => { simiWalls.create(bush.x + 16, bush.y + 16, 'bush_square').setScale(0.25).refreshBody().setOrigin(0.5)});


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

    sceneState.audioPlaying = true;

    // emitter for music
    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.on('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      sceneBGM.pause()
      sceneState.audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    gameState.emitter.on('resume_bgm', () => {
      sceneBGM.resume();
      sceneState.audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)
    gameState.emitter.on('death_bgm', () => {
      sceneBGM.pause()
      deathBGM.play()
    }, this)


    // gameState.emitter.on('danger_bgm_stop', () => {
    // sceneState.danger = false
    // }, this)
    // gameState.emitter.on('danger_bgm_play', () => {
    //   // if (!sceneState.danger) {
    //   sceneBGM.pause()
    //   dangerBGM.play()
    //   sceneState.danger = true
    //   // }
    // }, this)
    // dangerBGM.once('complete', () => {
    //   sceneState.danger = false
    //   sceneBGM.resume()
    // }, this)

    audioButton.on('pointerup', () => {
      if (sceneState.audioPlaying) {
        gameState.emitter.emit('pause_bgm')
      } else {
        gameState.emitter.emit('resume_bgm')
      }
    });
    gameState.emitter.emit('play_bgm')


    // this.enemies = game.add.group();
    this.enemy2 = this.physics.add.sprite(320, 320, 's_catcher');
    this.enemy2.setCollideWorldBounds(true);
    this.enemy3 = this.physics.add.sprite(274, 242, 's_catcher');
    this.enemy3.setCollideWorldBounds(true);


    // lose health
    function reduceHealth(obj1, obj2) {
      obj2.setVelocityX(0)
      obj2.setVelocityY(0)

      this.time.addEvent({
        delay: 2000,
        callbackScope: this,
        loop: false,
        callback: () => {
          sceneState.healthTrigger = true;
          this.time.removeAllEvents()
        }
      })

      // console.log(`Health Trigger:  ${sceneState.healthTrigger}`)
      const currentTrigger = true
      if (sceneState.healthTrigger && currentTrigger) {
        gameState.healthVal -= 10
        sceneState.healthTrigger = false
      }
      sceneState.healthTrigger = false;
    }

    this.physics.add.collider(this.enemy2, [walls, sceneState.sign, this.enemy2, this.enemy3]);
    this.physics.add.collider(this.enemy3, [walls, sceneState.sign, this.enemy2, this.enemy3]);
    this.physics.add.overlap(gameState.player, this.enemy2, reduceHealth.bind(this))
    this.physics.add.overlap(gameState.player, this.enemy3, reduceHealth.bind(this))


    //tween
    this.tweenEnemy2 = this.tweens.add({
      targets: this.enemy2,
      x: settings.tweenRate_easy,
      ease: 'Sine',
      duration: 2500,
      repeat: -1,
      yoyo: true,
    })

    this.tweenEnemy3 = this.tweens.add({
      targets: this.enemy3,
      y: settings.tweenRate_easy,
      ease: 'Sine',
      duration: 2500,
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

    function biDirectional_enemy(enemy) {
      if (enemy.body.velocity.x > 0) {
        enemy.flipX = false;
        enemy.anims.play('s_catcher', true);
      } else if (enemy.body.velocity.x < 0) {
        enemy.flipX = true;
        enemy.anims.play('s_catcher', true);
      } else {
        enemy.anims.pause();
      }
    }

    biDirectional_enemy(this.enemy3)
    biDirectional_enemy(this.enemy2)

    // if (this.tweenEnemy2.isPlaying()) {

    // }

    function distanceCalc(gameObj1, gameObj2) {
      return Phaser.Math.Distance.Chebyshev(gameObj1.x, gameObj1.y, gameObj2.x, gameObj2.y)
    }

    if ((distanceCalc(gameState.player, this.enemy2) < settings.enemyChaseDistance) && !this.physics.overlap(gameState.player, this.enemy2)) {
      this.tweenEnemy2.pause();
      this.physics.moveToObject(this.enemy2, gameState.player, settings.enemyMoveSpeed); //** */
      // sceneState.dangerState = true
    } else {
      // sceneState.dangerState = false
      this.enemy2.setVelocityX(0)
      this.enemy2.setVelocityY(0)
      // this.tweenEnemy2.play()
    }

    if (distanceCalc(gameState.player, this.enemy3) < settings.enemyChaseDistance && !this.physics.overlap(gameState.player, this.enemy3)) {
      this.tweenEnemy3.pause();
      this.physics.moveToObject(this.enemy3, gameState.player, settings.enemyMoveSpeed); //** */
      // sceneState.dangerState = true
    } else {
      // sceneState.dangerState = false
      this.enemy3.setVelocityX(0)
      this.enemy3.setVelocityY(0)
      // this.tweenEnemy3.play()
    }

    // if (sceneState.dangerState && gameState.health > 0) {
    //   gameState.emitter.emit('pause_bgm')
    //   gameState.emitter.emit('danger_bgm_play')
    // } else {
    //   gameState.emitter.emit('danger_bgm_stop')
    //   gameState.emitter.emit('resume_bgm')
    // }

    // message cleaner
    if (gameState.message) {
      this.time.delayedCall(2000, gameState.message.destroy())
    }


    // controls
    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('b_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.up.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('f_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.down.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.left.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.right.getDuration() * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (settings.twoKeyMultiplier * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityY(-settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (settings.twoKeyMultiplier * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityY(settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.setVelocityY(0);
      gameState.player.anims.pause()
      gameState.player.angle = 0;

    }

    // health department
    let cache = gameState.healthVal;
    gameState.health = function (tracked, cached) {
      if (gameState.healthVal >= 0 || Math.abs(tracked - cached > 5)) {
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
          if ((gameState.healthVal - bar >= -2.5) && (gameState.healthVal - bar <= 2.5)) {
            healthTickers[bar]()
          }
        }
      }
    }
    gameState.health(gameState.healthVal, cache)

    if (gameState.healthVal < 0) {
      sceneState.levelText.destroy()
      sceneState.levelText = this.add.text(180, 100, 'Game Over', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
      this.scene.pause()
      gameState.emitter.emit('pause_bgm')
      // gameState.emitter.emit('danger_bgm_stop')
      gameState.emitter.emit('death_bgm')
    }

  }
}