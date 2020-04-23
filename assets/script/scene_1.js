'use strict'
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @TODO fix danger audio queue, health bar responsiveness
 */

const scene_1_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 3200,
  worldHeight: 3200,
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71, // calculated
  playerSpawnPosition: [80, 80],
  enemyMoveSpeed: 90,
  enemyChaseDistance: 80,
  twoKeyMultiplier: 0.6,
}

class Scene_1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1' });
  }

  preload() {
    gameFunctions.loading.call(this);

    this.load.image('bg', './sprites/testing/100x100.png'); // testing bg
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
    const healthPath = './sprites/health-bar'
    this.load.image('health_100', healthPath + '/health_100.png');
    this.load.image('health_90', healthPath + '/health_90.png');
    this.load.image('health_85', healthPath + '/health_85.png');
    this.load.image('health_80', healthPath + '/health_80.png');
    this.load.image('health_70', healthPath + '/health_70.png');
    this.load.image('health_65', healthPath + '/health_65.png');
    this.load.image('health_55', healthPath + '/health_55.png');
    this.load.image('health_50', healthPath + '/health_50.png');
    this.load.image('health_45', healthPath + '/health_45.png');
    this.load.image('health_40', healthPath + '/health_40.png');
    this.load.image('health_30', healthPath + '/health_30.png');
    this.load.image('health_20', healthPath + '/health_20.png');
    this.load.image('health_15', healthPath + '/health_15.png');
    this.load.image('health_10', healthPath + '/health_10.png');

    // generics
    this.load.image('girl_1', './sprites/family/girl_1.png');
    this.load.image('bone', './sprites/items/bone.png');

    // level 1 specifics
    const level_1_path = './sprites/level_1'
    this.load.image('fence_horizontal', level_1_path + '/fence_horizontal.png');
    this.load.image('fence_vertical', level_1_path + '/fence_vertical.png');
    this.load.image('bush_square', level_1_path + '/bush_square.png');
    this.load.image('recycle', level_1_path + '/recycle.png');
    this.load.image('fir_tree', level_1_path + '/fir_tree.png');
    this.load.image('bench', level_1_path + '/bench.png');
  }


  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.scene.remove("Menu"); // maybe keep menu?
    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);//.setScale(0.25);

    // level title
    this.levelText = this.add.text(scene_1_settings.canvasWidth / 2 - 50, scene_1_settings.canvasHeight / 2 - 50, 'Level 1', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
    this.time.delayedCall(5000, this.levelText.destroy());

    // initialize health
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
    gameState.healthVal = 100;

    // initialize player & controls
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(scene_1_settings.playerSpawnPosition[0], scene_1_settings.playerSpawnPosition[1], 'f_dog').setScale(1).setDepth(10);
    gameState.player.setCollideWorldBounds(true);
    // gameState.player.setBounce(10, 10)

    // bones
    gameState.bone = this.physics.add.sprite(16 * 32, 16 * 32, 'bone').setOrigin(0.5);
    this.physics.add.overlap(gameState.player, gameState.bone, () => {
      let cache = gameState.healthVal;
      (gameState.healthVal + 40) > 100 ? gameState.healthVal = 100 : gameState.healthVal += 40;
      gameState.bone.destroy();
      gameState.health(gameState.healthVal, cache);
    })
    // const bones = this.physics.add.staticGroup()
    // const boneLocations = [{ x: 14, y: 14 }]
    // boneLocations.forEach(bone => { bones.create(bone.x * 32, bone.y * 32, 'bone').refreshBody().setOrigin(0.5) })
    // this.physics.add.overlap(gameState.player, bones, () => {
    //   let cache = gameState.healthVal;
    //   (gameState.healthVal + 40) > 100 ? gameState.healthVal = 100 : gameState.healthVal += 40;
    //   bones.remove(this) // how to isolate the bone in contact
    //   // gameState.bone.destroy();
    //   gameState.health(gameState.healthVal, cache);
    // })

    // scene transition 
    this.girl_1 = this.physics.add.sprite(20 * 32 - 16, 20 * 32 - 16, 'girl_1').setScale(0.25).setOrigin(0.5)//.setSize(32, 32, 0, 0).setOffset(0, 0);
    this.physics.add.overlap(gameState.player, this.girl_1, () => {
      sceneBGM.stop()
      sceneBGM.destroy()
      this.sound.play('success_audio')
      this.scene.stop("Scene_1")
      this.scene.start("Scene_1_end")
    })


    // --- Static --- //

    // walls
    const walls = this.physics.add.staticGroup();
    const horizontalWalls = [{ x: 2, y: 4 }, { x: 6, y: 4 }, { x: 12, y: 4 }]; // batch creation
    horizontalWalls.forEach(wall => { walls.create(wall.x * 32, wall.y * 32 + 16, 'fence_horizontal').setScale(1, 0.25).refreshBody().setOrigin(0.5) });

    const verticalWalls = [{ x: 16, y: 2 }, { x: 16, y: 4 }, { x: 16, y: 6 }, { x: 16, y: 8 }];
    verticalWalls.forEach(wall => { walls.create(wall.x * 32 + 16, wall.y * 32, 'fence_vertical').setScale(0.25, 1).refreshBody().setOrigin(0.5) });
    this.physics.add.collider(gameState.player, walls);

    const firTrees = walls.create(12 * 32, 8 * 32, 'fir_tree').setScale(0.25).setOrigin(0.5).refreshBody().setSize(64, 64, 0, 0)
    this.physics.add.collider(firTrees, [gameState.player, this.enemy2, this.enemy3])

    // pass through walls
    this.simiWalls = this.physics.add.staticGroup();
    const squareBushes = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 15, y: 0 }, { x: 15, y: 1 }, { x: 15, y: 2 }, { x: 15, y: 3 }, { x: 15, y: 4 }, { x: 15, y: 5 }, { x: 15, y: 6 }, { x: 15, y: 7 }, { x: 15, y: 8 }, { x: 15, y: 9 },];
    squareBushes.forEach(bush => { this.simiWalls.create(bush.x * 32 + 16, bush.y * 32 + 16, 'bush_square').setScale(0.25).refreshBody().setOrigin(0.5).setSize(40, 40, 0, 0).setOffset(-4, -4) });


    // --- Interactive --- //

    // recycle
    this.recycle = this.physics.add.sprite(128, 64, 'recycle').setScale(0.25).setOrigin(0).setInteractive();
    this.recycle.setCollideWorldBounds(true);
    this.recycle.setDamping(true);
    this.recycle.setDrag(0.5);
    this.recycle.setMaxVelocity(50);
    this.physics.add.collider(gameState.player, this.recycle, () => {
      //   const str = 'Danger up ahead';
      //   sceneState.message = this.add.text(width / 2 - 75, height * 0.9, str, { fontSize: 16, color: '#FF0B0F' }).setScrollFactor(0);

      //   this.time.delayedCall(5000, sceneState.message.destroy()); // timer doesn't work
      //   // this.time.addEvent({
      //   //   delay: 2000,
      //   //   callbackScope: this,
      //   //   loop: true,
      //   //   callback: () => { sceneState.message.destroy(); console.log("this") },
      //   // });
    });
    this.physics.add.collider(this.recycle, [this.enemy3, this.enemy2, walls]);

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
    const dangerBGM = this.sound.add('danger_audio', sound_config);
    const deathBGM = this.sound.add('death_audio', sound_config.loop = false)
    this.audioPlaying = true;

    // emitter for music
    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.on('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      sceneBGM.pause()
      this.audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    gameState.emitter.on('resume_bgm', () => {
      sceneBGM.resume();
      this.audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)
    gameState.emitter.on('death_bgm', () => {
      sceneBGM.pause()
      deathBGM.play()
    }, this)

    // gameState.emitter.on('danger_bgm_stop', () => { // doesn't work
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

    gameState.emitter.emit('play_bgm');
    const audioButton = this.add.sprite(scene_1_settings.canvasWidth - 20, scene_1_settings.canvasHeight - 20, 'audio_button_on').setScale(0.6).setScrollFactor(0);
    audioButton.setInteractive();
    audioButton.on('pointerup', () => { this.audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    // this.enemies = game.add.group();
    this.enemy2 = this.physics.add.sprite(10 * 32 - 16, 0 * 32 - 16, 's_catcher');
    this.enemy2.setCollideWorldBounds(true);
    this.enemy3 = this.physics.add.sprite(12 * 32 - 16, 12 * 32 - 16, 's_catcher');
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
          this.healthTrigger = true;
          this.time.removeAllEvents()
        }
      })

      // const currentTrigger = true && currentTrigger
      if (this.healthTrigger) {
        gameState.healthVal -= 10
        this.healthTrigger = false
      }
    }

    //general colliders
    this.physics.add.collider(this.enemy2, [walls, this.simiWalls, this.recycle, this.enemy2, this.enemy3]);
    this.physics.add.collider(this.enemy3, [walls, this.simiWalls, this.recycle, this.enemy2, this.enemy3]);
    this.physics.add.overlap(gameState.player, this.enemy2, reduceHealth.bind(this))
    this.physics.add.overlap(gameState.player, this.enemy3, reduceHealth.bind(this))

    // camera department
    this.cameras.main.setBounds(0, 0, scene_1_settings.worldWidth, scene_1_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_1_settings.worldWidth, scene_1_settings.worldHeight);
    this.cameras.main.startFollow(gameState.player);

    // builds all animations
    this.animate();

    //tween @TODO hard coded
    this.tweenEnemy_horizontal = this.tweens.add({
      targets: [this.enemy2],
      y: 10 * 32,
      ease: 'Linear',
      duration: 4000,
      repeat: -1,
      yoyo: true,
      loopDelay: 2000,
      // onActive: () => { this.enemy2.anims.play('s_catcher', true) }
    })

    this.tweenEnemy_vertical = this.tweens.add({
      targets: [this.enemy3],
      x: 10 * 32,
      ease: 'Linear',
      duration: 2000,
      repeat: -1,
      yoyo: true,
      loopDelay: 2000,
      // onActive: () => { this.enemy3.anims.play('s_catcher', true) }
    })
  }

  animate() {
    this.anims.create({
      key: 'f_move',
      frames: this.anims.generateFrameNumbers('f_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'l_move',
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 40),
      repeat: -1
    });
  }

  update() {
    // drag over simiWalls
    const overlap = this.physics.overlap(gameState.player, this.simiWalls)
    if (overlap) {
      gameState.player.setDamping(true);
      gameState.player.setDrag(0.6);
      gameState.player.setMaxVelocity(50)
    } else {
      gameState.player.setDamping(false);
      gameState.player.setDrag(1);
      gameState.player.setMaxVelocity(scene_1_settings.moveSpeed)
    }

    // flip animation for enemies
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

    // distance boolean
    function distanceCalc(gameObj1, gameObj2) {
      return Phaser.Math.Distance.Chebyshev(gameObj1.x, gameObj1.y, gameObj2.x, gameObj2.y)
    }

    if ((distanceCalc(gameState.player, this.enemy2) < scene_1_settings.enemyChaseDistance) && !this.physics.overlap(gameState.player, this.enemy2)) {
      this.tweenEnemy_horizontal.pause();
      this.physics.moveToObject(this.enemy2, gameState.player, scene_1_settings.enemyMoveSpeed);
      // sceneState.dangerState = true
    } else {
      // sceneState.dangerState = false
      this.enemy2.setVelocityX(0)
      this.enemy2.setVelocityY(0)
      // this.tweenEnemy2.play()
    }

    if (distanceCalc(gameState.player, this.enemy3) < scene_1_settings.enemyChaseDistance && !this.physics.overlap(gameState.player, this.enemy3)) {
      this.tweenEnemy_vertical.pause();
      this.physics.moveToObject(this.enemy3, gameState.player, scene_1_settings.enemyMoveSpeed);
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

    // controls
    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-scene_1_settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('b_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.up.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(scene_1_settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('f_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.down.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-scene_1_settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.left.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(scene_1_settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.right.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityY(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityY(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityY(scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityY(scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * scene_1_settings.movementHealthCostRatio)
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
      if (tracked === cached) {
        // console.log(`tracked: ${tracked} cached: ${cached}`)
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
          if ((gameState.healthVal - bar >= -3.5) && (gameState.healthVal - bar <= 3.5)) {
            healthTickers[bar]()
          }
        }
      }
    }

    if (gameState.healthVal > 0) {
      gameState.health(gameState.healthVal, cache)
    } else {
      this.levelText.destroy()
      this.levelText = this.add.text(scene_1_settings.canvasWidth / 2 - 50, scene_1_settings.canvasHeight / 2 - 50, 'Game Over', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
      this.scene.pause()
      gameState.emitter.emit('pause_bgm')
      // gameState.emitter.emit('danger_bgm_stop')
      gameState.emitter.emit('death_bgm')
    }

  }
}