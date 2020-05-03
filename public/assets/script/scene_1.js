'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @TODO fix audio transition
 */

const scene_1_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 1536,  // 48 x 32
  worldHeight: 1440, // 46 x 32
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71,
  twoKeyMultiplier: 0.707,
  playerSpawnPosition: [0, 3],
  enemyMoveSpeed: 85,
  enemyChaseDistance: 100,
  boneHealthRegen: 30,
  familySpawnPosition: [47, 1],
  enemyHealthReduction: 0.1, // per 16ms
  levelTime: 300, // s

  enemy: [
    { "id": 1, "x": 9, "y": 1, "tweenX": 0, "tweenY": 5 },
    { "id": 2, "x": 6, "y": 8, "tweenX": 7, "tweenY": 0 },
    { "id": 3, "x": 22, "y": 3, "tweenX": 0, "tweenY": 6 },
    { "id": 4, "x": 10, "y": 23, "tweenX": 0, "tweenY": 7 },
    { "id": 5, "x": 32, "y": 38, "tweenX": -7, "tweenY": 0 },
    { "id": 6, "x": 33, "y": 38, "tweenX": 0, "tweenY": -7 },
    { "id": 7, "x": 32, "y": 39, "tweenX": 0, "tweenY": 7 },
    { "id": 8, "x": 33, "y": 39, "tweenX": 7, "tweenY": 0 },
    { "id": 9, "x": 43, "y": 45, "tweenX": 0, "tweenY": -7 },
    { "id": 10, "x": 45, "y": 43, "tweenX": -8, "tweenY": 0 }
  ],
  enemyTweenDurationMultiplier: 500,
  enemyTweenLoopDelay: 20000,

  coins: [
    { "x": 25, "y": 3 },
    { "x": 44, "y": 1 },
    { "x": 42, "y": 17 },
    { "x": 21, "y": 25 },
    { "x": 3, "y": 23 },
    { "x": 17, "y": 41 },
    { "x": 40, "y": 45 },
  ],
  coinScoreBonus: 1000
}

class Scene_1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1' });
  }

  preload() {
    !level_1 ? (() => { throw new Error("Missing map data") })() : null;
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.image('bg', './assets/sprites/level_1/bg.png'); // testing bg
    this.load.spritesheet('f_dog', './assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('s_catcher', './assets/sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('back_button', './assets/sprites/buttons/button_back.png');                  //
    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');                 //
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');               //
    this.load.audio('scene_1_bgm', './assets/bgm/Meme_Scene_1.mp3');                             //
    this.load.audio('success_audio', './assets/bgm/clips/Success.mp3');                          //
    this.load.audio('danger_audio', './assets/bgm/Meme_action.mp3');                             //
    this.load.audio('death_audio', './assets/bgm/clips/Meme_death.mp3');                         //

    // generics
    this.load.image('girl_1', './assets/sprites/family/girl_1.png');                             //
    this.load.image('bone', './assets/sprites/items/bone.png');                                  //
    this.load.image('coin', './assets/sprites/items/coin.png');                                  //

    // level 1 specifics
    const level_1_path = './assets/sprites/level_1'
    this.load.image('bench', level_1_path + '/bench_lev1.png');                                  //
    this.load.image('birch_tree', level_1_path + '/birch_tree.png');                             //
    this.load.image('bush_round', level_1_path + '/bush_round.png');                             //
    this.load.image('bush_square', level_1_path + '/bush_square.png');                           //
    this.load.image('fence_corner_leftBottom', level_1_path + '/fence_corner_leftBottom.png');   //
    this.load.image('fence_corner_leftTop', level_1_path + '/fence_corner_leftTop.png');         //
    this.load.image('fence_corner_rightBottom', level_1_path + '/fence_corner_rightBottom.png'); //
    this.load.image('fence_corner_rightTop', level_1_path + '/fence_corner_rightTop.png');       //
    this.load.image('fence_horizontal', level_1_path + '/fence_horizontal.png');                 //
    this.load.image('fence_vertical_left', level_1_path + '/fence_vertical_left.png');           //
    this.load.image('fence_vertical_right', level_1_path + '/fence_vertical_right.png');         //
    this.load.image('fir_tree', level_1_path + '/fir_tree.png');                                 //
    this.load.image('flower_1', level_1_path + '/flower_1.png');                                 //
    this.load.image('flower_2', level_1_path + '/flower_2.png');                                 //
    this.load.image('light_post', level_1_path + '/light_post.png');                             //
    this.load.image('recycle_bin', level_1_path + '/recycle_bin.png');                           //
    this.load.image('sign', level_1_path + '/sign.png');                                         //
    this.load.image('stump', level_1_path + '/stump.png');                                       //

    // map from JSON option (throws error if load from static folder)
    // this.load.json('mapData', 'maps/level_1.json');
  }


  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    // this.scene.remove("Menu"); // maybe keep menu?
    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);

    // camera department
    this.camera = this.cameras.main.setBounds(0, 0, scene_1_settings.worldWidth, scene_1_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_1_settings.worldWidth, scene_1_settings.worldHeight);

    // map from JSON option
    // const map = this.cache.json.get('mapData');

    // level title
    this.levelText = this.add.text(scene_1_settings.canvasWidth / 2 - 50, scene_1_settings.canvasHeight / 2 - 50, 'Level 1', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
    this.time.delayedCall(5000, this.levelText.destroy());

    // initialize health
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
    gameState.healthVal = 100;
    gameState.bonusScore = 0;

    // initialize player & controls
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(scene_1_settings.playerSpawnPosition[0] * 32 - 16, scene_1_settings.playerSpawnPosition[1] * 32 - 16, 'f_dog').setSize(30, 30).setDepth(1);
    gameState.player.setCollideWorldBounds(true);
    // gameState.player.setBounce(10, 10)

    // follows player
    this.camera.startFollow(gameState.player);

    // time tracker
    this.levelTime = scene_1_settings.levelTime;
    this.timeText = this.add.text(scene_1_settings.canvasWidth / 2, 10, `Level time: ${this.levelTime}`, { fontSize: 12, color: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
    this.input.keyboard.once('keydown', () => {
      this.startTime = this.time.now;

      // 1s tick call
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (gameState.healthVal > 0) {
            this.levelTime--
            this.timeText.setText(`Level time: ${this.levelTime}`);
          }
        },
        callbackScope: this,
        repeat: -1
      })
    }, this);

    // score tracker
    this.score = gameState.bonusScore + parseInt(this.levelTime * gameState.healthVal);
    this.scoreText = this.add.text(scene_1_settings.canvasWidth / 2, 30, `Score: ${this.score}`, { fontSize: 12, color: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    // scene transition 
    this.girl_1 = this.physics.add.sprite(scene_1_settings.familySpawnPosition[0] * 32 - 16, scene_1_settings.familySpawnPosition[1] * 32 - 16, 'girl_1');
    this.physics.add.overlap(gameState.player, this.girl_1, () => {
      sceneBGM.stop();
      sceneBGM.destroy();

      // timer
      gameState.emitter.emit('end_time');

      this.sound.play('success_audio');
      this.scene.stop("Scene_1");
      this.scene.start("Scene_1_end");
    })

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }

    const sceneBGM = this.sound.add('scene_1_bgm', sound_config);
    const dangerBGM = this.sound.add('danger_audio', sound_config);
    const deathBGM = this.sound.add('death_audio', sound_config);
    this.sound.pauseOnBlur = false;
    let audioPlaying = true,
      danger_bgm_toggle = true;

    // emitter for music
    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.on('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      this.dangerState && dangerBGM.isPaused ? dangerBGM.resume() : gameState.healthVal > 0 ? sceneBGM.resume() : deathBGM.resume();
      audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this);
    gameState.emitter.once('death_bgm', () => {
      sceneBGM.pause();
      if (audioPlaying) {
        deathBGM.play();
        // audioPlaying = true
      }
    }, this);
    gameState.emitter.on('danger_bgm_play', () => {
      if (danger_bgm_toggle && audioPlaying) {
        sceneBGM.pause();
        dangerBGM.play();
        danger_bgm_toggle = false
        audioPlaying = true
      }
    }, this);
    gameState.emitter.on('danger_bgm_stop', () => {
      if (!danger_bgm_toggle && audioPlaying) {
        dangerBGM.stop();
        sceneBGM.resume();
        danger_bgm_toggle = true
      }
    }, this);

    // emitter for time
    gameState.emitter.once('end_time', () => {
      gameState.score = this.score;
      this.endTime = this.time.now;
      gameState.scene_1_time_raw = this.endTime - this.startTime;
      gameState.scene_1_time = gameFunctions.timeConvert(this.endTime - this.startTime);
    }, this)

    gameState.emitter.emit('play_bgm');

    // buttons
    const audioButton = this.add.sprite(scene_1_settings.canvasWidth - 20, scene_1_settings.canvasHeight - 20, 'audio_button_on').setScale(0.6).setScrollFactor(0).setDepth(10).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    this.backButton = this.add.sprite(scene_1_settings.canvasWidth / 2, scene_1_settings.canvasHeight / 2 + 50, 'back_button').setDepth(10).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => { this.scene.restart() }
      })
    });

    // --- Static --- //

    // blocking walls
    const walls = this.physics.add.staticGroup();
    level_1.fenceHorizontal.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_horizontal').setSize(32, 16) });
    level_1.fenceVertical_left.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_vertical_left').setSize(16, 32).setOffset(0, 0) });
    level_1.fenceVertical_right.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_vertical_right').setSize(16, 32).setOffset(16, 0) });
    level_1.fenceCorner_leftBottom.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_corner_leftBottom').setSize(32, 16) });
    level_1.fenceCorner_rightBottom.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_corner_rightBottom').setSize(32, 16) });
    level_1.fenceCorner_leftTop.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_corner_leftTop').setSize(16, 24).setOffset(0, 8) });
    level_1.fenceCorner_rightTop.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'fence_corner_rightTop').setSize(16, 24).setOffset(16, 8) });

    // trees
    level_1.firTree.forEach(obj => { walls.create(obj.x * 32, obj.y * 32, 'fir_tree').setSize(12, 10).setOffset(25, 54).setDepth(3) });
    level_1.birchTree.forEach(obj => { walls.create(obj.x * 32, obj.y * 32, 'birch_tree').setSize(16, 12).setOffset(26, 46).setDepth(3) });

    // things
    level_1.bench.forEach(obj => { walls.create(obj.x * 32, obj.y * 32 - 16, 'bench') });
    level_1.lightPost.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 8, 'light_post').setSize(14, 16).setOffset(10, 46).setDepth(2) });
    level_1.sign.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'sign') });

    // wall collider
    this.physics.add.collider(walls, [gameState.player]); //@TODO

    // pass through walls
    this.semiWalls = this.physics.add.staticGroup();
    level_1.squareBush.forEach(obj => { this.semiWalls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'bush_square') });
    level_1.circularBush.forEach(obj => { this.semiWalls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'bush_round') });
    level_1.flower_1.forEach(obj => { this.semiWalls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'flower_1') });
    level_1.flower_2.forEach(obj => { this.semiWalls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'flower_2') });
    level_1.treeStump.forEach(obj => { this.semiWalls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'stump') });


    // // --- Interactive --- //

    // bones
    this.consumable = this.physics.add.group();
    level_1.bone.forEach(obj => { this.consumable.create(obj.x * 32 - 16, obj.y * 32 - 16, 'bone').setSize(16, 16) });
    this.consumable.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (gameState.healthVal + scene_1_settings.boneHealthRegen) > 100 ? gameState.healthVal = 100 : gameState.healthVal += scene_1_settings.boneHealthRegen;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // coins
    this.collectables = this.physics.add.group();
    scene_1_settings.coins.forEach(coin => { this.collectables.create(coin.x * 32 - 16, coin.y * 32 - 16, 'coin').setCircle(15, 1, 0) });
    this.collectables.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        gameState.bonusScore += scene_1_settings.coinScoreBonus;
        gameState.coinCount += 1;
        gameObj.destroy();
      });
    });

    // recycle
    this.moveable = this.physics.add.group();
    level_1.recycleBin.forEach(obj => {
      this.moveable.create(obj.x * 32 - 16, obj.y * 32 - 16, 'recycle_bin').setInteractive().setCollideWorldBounds(true)
        .setDamping(true).setDrag(0.5).setMaxVelocity(50).setMass(1.5).setSize(28, 28);
    });
    let recycleCollider = true
    this.physics.add.collider(this.moveable, [this.enemy2, this.enemy1, walls]);
    this.physics.add.collider(this.moveable, gameState.player, () => {
      if (recycleCollider) {
        const str = 'Bark';
        const message = this.add.text(scene_1_settings.canvasWidth / 2 - 30, scene_1_settings.canvasHeight - 30, str, { fontSize: 16, color: '#FF7A00' }).setScrollFactor(0);
        this.tweens.add({
          targets: message,
          alpha: 0,
          duration: 1000,
          loop: 2,
          ease: 'Linear',
          yoyo: false,
          onComplete: () => { message.destroy(); recycleCollider = true }
        });
        recycleCollider = false;
      }
    });

    // enemy group
    this.enemies = this.physics.add.group();
    scene_1_settings.enemy.forEach(function (obj) {
      this.enemies.create(obj.x * 32 - 16, obj.y * 32 - 16, 's_catcher').setCollideWorldBounds(true)
        .setData({
          "id": obj.id,
          "x": obj.x,
          "y": obj.y,
          "tweenX": obj.tweenX,
          "tweenY": obj.tweenY
        });
    }, this);
    this.enemies.getChildren().forEach(function (gameObj) {
      // enemy colliders
      this.physics.add.collider(gameObj, [walls, this.moveable, this.enemies]);

      // tween
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: (gameObj.getData("x") * 32 + gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * scene_1_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: scene_1_settings.enemyTweenLoopDelay
        });
      } else if (gameObj.getData("tweenY") !== 0) {
        this.tweens.add({
          targets: gameObj,
          y: (gameObj.getData("y") * 32 + gameObj.getData("tweenY") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenY")) * scene_1_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: scene_1_settings.enemyTweenLoopDelay
        });
      }
    }, this);

    // builds all animations
    this.animate();
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
    // player drag over semiWalls
    if (gameState.player) {
      this.physics.overlap(gameState.player, this.semiWalls) ? gameState.player.setDamping(true).setDrag(0.6).setMaxVelocity(50) : gameState.player.setDamping(false).setDrag(1).setMaxVelocity(scene_1_settings.moveSpeed);
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

    this.dangerState = false;
    const distanceCalc = gameFunctions.distanceCalc;

    this.tweens.getAllTweens().forEach(tween => {
      const gameObj = tween.targets[0];

      // ignores text tweens
      if (gameObj.type === "Sprite") {
        tween.isPlaying() ? gameObj.anims.play('s_catcher', true) : biDirectional_enemy(gameObj);

        if (this.physics.overlap(gameState.player, gameObj)) {
          gameObj.setVelocityX(0).setVelocityY(0);
          gameState.healthVal -= scene_1_settings.enemyHealthReduction;
          this.dangerState = true;
        } else if (distanceCalc(gameState.player, gameObj) < scene_1_settings.enemyChaseDistance) {
          tween.pause();
          this.physics.moveToObject(gameObj, gameState.player, scene_1_settings.enemyMoveSpeed);
          this.dangerState = true;
        } else {
          if (Math.round(gameObj.x) === gameObj.getData("x") * 32 - 16 && Math.round(gameObj.y) === gameObj.getData("y") * 32 - 16) {
            tween.play();
          } else {
            this.physics.moveTo(gameObj, gameObj.getData("x") * 32 - 16, gameObj.getData("y") * 32 - 16);
          }
        }

        // enemy drag over semiWalls
        this.physics.overlap(gameObj, this.semiWalls) ? gameObj.setDamping(true).setDrag(0.1).setMaxVelocity(20) : gameObj.setDamping(false).setDrag(1).setMaxVelocity(scene_1_settings.enemyMoveSpeed);
      }
    });

    // danger_bgm emitter
    (this.dangerState && gameState.healthVal > 0) ? gameState.emitter.emit('danger_bgm_play') : gameState.emitter.emit('danger_bgm_stop');


    if (gameState.healthVal > 0) {
      gameFunctions.control(gameState, scene_1_settings);
      gameFunctions.activeHealthTextures(gameState);

      // update score
      this.score = gameState.bonusScore + parseInt(this.levelTime * gameState.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);

      gameState.emitter.emit('end_time');
      this.levelText.destroy();
      this.levelText = this.add.text(scene_1_settings.canvasWidth / 2, scene_1_settings.canvasHeight / 2 - 50, 'Game Over', { fontSize: 30, color: 'white' }).setScrollFactor(0).setOrigin(0.5);
      this.tweens.add({
        targets: this.levelText,
        alpha: 0,
        duration: 2000,
        loop: -1,
        ease: 'Linear',
        yoyo: false,
      });
      this.physics.pause();
      this.anims.pauseAll();
      // this.tweens.pauseAll();
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }
}