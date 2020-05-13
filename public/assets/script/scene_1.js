'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 */
class Scene_1 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_1' }) }

  init(data) {
    if (data) { // not used due to initial scene
      this.playerScene = data.scene;
      this.playerScore = data.score;
      this.playerBonus = data.bonus;
      this.playerHealth = data.health;
      this.playerTime_raw = data.time_raw;
      this.forwardData = data;
    }

    this.scene_settings = {
      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 48,
      worldHeight: 32 * 45,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      playerStartingHealth: 100,
      playerSpawnPosition: [0, 3],
      familySpawnPosition: [47, 0],

      enemyMoveSpeed: 85,
      enemyChaseDistance: 100,
      enemyHealthReduction: 0.1, // per 16ms

      levelTime: 200, // s
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      backgroundDepth: -1,
      wallSpriteDepth: 1,
      playerSpriteDepth: 2,
      treeSpriteDepth: 3,
      scoreTimerBackgroundDepth: 4,
      scoreTextDepth: 5,
      healthBarDepth: 5,
      deathBackgroundMaskDepth: 6,
      deathBackgroundUnmaskDepth: 7,
      messageDepth: 10,
      buttonDepth: 10,

      enemyTweenDurationMultiplier: 500,
      enemyTweenLoopDelay: 20000,

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
      coins: [
        { "x": 25, "y": 3 },
        { "x": 44, "y": 1 },
        { "x": 42, "y": 17 },
        { "x": 21, "y": 25 },
        { "x": 3, "y": 23 },
        { "x": 17, "y": 41 },
        { "x": 40, "y": 45 },
      ]
    }
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

    this.load.image('back_button', './assets/sprites/buttons/button_back.png');
    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');

    this.load.audio('scene_1_bgm', './assets/bgm/Zain_bgm_01.mp3');
    this.load.audio('success_audio', './assets/bgm/clips/Meme_success.mp3');
    this.load.audio('danger_audio', './assets/bgm/Meme_action.mp3');
    this.load.audio('death_audio', './assets/bgm/Zain_death.mp3');
    this.load.audio('bone_audio', './assets/bgm/clips/Zain_bone.mp3');
    this.load.audio('death_event_audio', './assets/bgm/clips/Zain_death_clip.mp3');

    // generics
    this.load.image('girl', './assets/sprites/family/girl.png');
    this.load.image('bone', './assets/sprites/items/bone.png');
    this.load.image('coin', './assets/sprites/items/coin.png');

    // level 1 specifics
    const level_1_path = './assets/sprites/level_1'
    this.load.image('bench', level_1_path + '/bench_lev1.png');
    this.load.image('birch_tree', level_1_path + '/birch_tree.png');
    this.load.image('bush_round', level_1_path + '/bush_round.png');
    this.load.image('bush_square', level_1_path + '/bush_square.png');
    this.load.image('fence_corner_leftBottom', level_1_path + '/fence_corner_leftBottom.png');
    this.load.image('fence_corner_leftTop', level_1_path + '/fence_corner_leftTop.png');
    this.load.image('fence_corner_rightBottom', level_1_path + '/fence_corner_rightBottom.png');
    this.load.image('fence_corner_rightTop', level_1_path + '/fence_corner_rightTop.png');
    this.load.image('fence_horizontal', level_1_path + '/fence_horizontal.png');
    this.load.image('fence_vertical_left', level_1_path + '/fence_vertical_left.png');
    this.load.image('fence_vertical_right', level_1_path + '/fence_vertical_right.png');
    this.load.image('fir_tree', level_1_path + '/fir_tree.png');
    this.load.image('flower_1', level_1_path + '/flower_1.png');
    this.load.image('flower_2', level_1_path + '/flower_2.png');
    this.load.image('light_post', level_1_path + '/light_post.png');
    this.load.image('recycle_bin', level_1_path + '/recycle_bin.png');
    this.load.image('sign', level_1_path + '/sign.png');
    this.load.image('stump', level_1_path + '/stump.png');

    // map from JSON option (throws error if load from static folder)
    // this.load.json('mapData', 'maps/level_1.json');
  }

  create() {
    // destroys loading assets
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    // map from JSON option
    // const map = this.cache.json.get('mapData');

    // img background
    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(this.scene_settings.backgroundDepth);

    // camera department
    this.camera = this.cameras.main.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);
    this.physics.world.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);

    // level title
    this.levelText = this.add.text(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2,
      'Level 1',
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    // initialize health
    [this.bonusScore, this.coinCount, this.healthVal] = [0, 0, this.scene_settings.playerStartingHealth];
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(this.scene_settings.healthBarDepth);

    // initialize player & controls
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      this.scene_settings.playerSpawnPosition[0] * 32,
      this.scene_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(this.scene_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true);

    // follows player
    this.camera.startFollow(gameState.player, false, 0.05, 0.05);

    // time tracker
    this.levelTime = this.scene_settings.levelTime;
    this.add.rectangle(this.scene_settings.canvasWidth / 2 + 70, 10, 260, 15).setFillStyle(0xffffff, 0.5).setScrollFactor(0).setDepth(this.scene_settings.scoreTimerBackgroundDepth);
    this.timeText = this.add.text(
      this.scene_settings.canvasWidth / 2, 10,
      `Level time: ${this.levelTime}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    // keydown event
    this.input.keyboard.once('keydown', () => {
      this.startTime = this.time.now;
      this.tweens.add({
        targets: this.levelText,
        duration: 1000,
        alpha: 0,
        onComplete: () => {
          this.levelText.destroy();
        }
      });

      // 1s tick call
      this.time.addEvent({
        delay: 1000,
        callbackScope: this,
        repeat: -1,
        callback: () => {
          if (this.healthVal > 0) {
            this.levelTime--;
            this.timeText.setText(`Level time: ${this.levelTime}`);
          }
        }
      });
    }, this);

    // score tracker
    this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
    this.scoreText = this.add.text(
      this.scene_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.scoreTextDepth);

    // scene transition 
    this.girl = this.physics.add.sprite(this.scene_settings.familySpawnPosition[0] * 32, this.scene_settings.familySpawnPosition[1] * 32, 'girl').setOrigin(0);
    this.physics.add.overlap(gameState.player, this.girl, () => {
      this.sound.pauseAll();

      // timer
      gameState.emitter.emit('end_time');
      audioPlaying ? this.sound.play('success_audio') : null;

      // forwarded data
      const forwardData = {
        scene: this.scene.key,
        score: this.score,
        bonus: this.bonusScore,
        health: this.healthVal,
        time_raw: this.scene_time_raw
      };
      this.scene.stop();
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

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

    const sceneBGM = this.sound.add('scene_1_bgm', sound_config),
      dangerBGM = this.sound.add('danger_audio', sound_config),
      deathBGM = this.sound.add('death_audio', sound_config),
      boneClip = this.sound.add('bone_audio', sound_config.loop = false),
      deathClip = this.sound.add('death_event_audio', sound_config.loop = false);

    this.sound.pauseOnBlur = false;
    let audioPlaying = true,
      danger_bgm_toggle = true;

    // event emitters
    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (this.dangerState && dangerBGM.isPaused) {
        dangerBGM.resume();
      } else if (this.healthVal > 0 && !deathBGM.isPaused) {
        sceneBGM.resume();
      } else {
        deathBGM.isPaused ? deathBGM.resume() : deathBGM.play();
      }
      audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.5);
    }, this);
    gameState.emitter.once('death_bgm', () => {
      this.levelText.destroy();
      this.levelText = this.add.text(
        this.scene_settings.canvasWidth / 2,
        this.scene_settings.canvasHeight / 2 - 50,
        'Game Over',
        { fontSize: 30, color: 'white' }).setScrollFactor(0).setOrigin(0.5).setDepth(this.scene_settings.messageDepth);
      this.tweens.add({
        targets: this.levelText,
        alpha: 0,
        duration: 2000,
        loop: -1,
        ease: 'Linear',
        yoyo: true,
      });

      const mask = this.add.rectangle(
        this.camera.centerX - 10,
        this.camera.centerY - 10,
        this.camera.displayWidth + 20,
        this.camera.displayHeight + 20).setFillStyle(0x000000, 0.2).setScrollFactor(0).setDepth(this.scene_settings.deathBackgroundMaskDepth);
      this.tweens.add({
        targets: mask,
        duration: 4000,
        fillAlpha: 0.9
      });

      const unmask = this.add.circle(
        this.camera.centerX + this.camera.displayWidth / 2 - 20,
        this.camera.centerY + this.camera.displayHeight / 2 - 20,
        10
      ).setFillStyle(0xffffff, 0).setScrollFactor(0).setDepth(this.scene_settings.deathBackgroundUnmaskDepth);
      this.tweens.add({
        targets: unmask,
        duration: 4000,
        fillAlpha: 0.9
      });

      this.sound.pauseAll();
      if (audioPlaying) {
        deathClip.play();
        deathBGM.setVolume(0).play();
        this.tweens.add({
          targets: deathBGM,
          volume: 0.8,
          duration: 1000,
          delay: 7000,
        });
      }
    }, this);
    gameState.emitter.on('danger_bgm_play', () => {
      if (danger_bgm_toggle && audioPlaying) {
        sceneBGM.pause();
        dangerBGM.setVolume(0).play();
        this.tweens.add({
          targets: dangerBGM,
          volume: 0.8,
          duration: 1000,
        });
        danger_bgm_toggle = false
        audioPlaying = true
      }
    }, this);
    gameState.emitter.on('danger_bgm_stop', () => {
      if (!danger_bgm_toggle && audioPlaying) {
        dangerBGM.stop();
        sceneBGM.setVolume(0).resume();
        this.tweens.add({
          targets: sceneBGM,
          volume: 0.8,
          duration: 2000,
        });
        danger_bgm_toggle = true
      }
    }, this);

    // emitter for time
    gameState.emitter.once('end_time', () => {
      this.endTime = this.time.now;
      this.scene_time_raw = this.endTime - this.startTime;
    }, this)

    gameState.emitter.emit('play_bgm');

    // buttons
    const audioButton = this.add.sprite(
      this.scene_settings.canvasWidth - 20,
      this.scene_settings.canvasHeight - 20,
      'audio_button_on').setScale(0.5).setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    this.backButton = this.add.sprite(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(this.scene_settings.buttonDepth).setVisible(false).setOrigin(0.5).setScrollFactor(0).setInteractive();
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => {
          this.sound.stopAll();
          this.scene.restart(); // ** no data passed due to this being the initial scene **
        }
      });
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
    level_1.firTree.forEach(obj => { walls.create(obj.x * 32, obj.y * 32, 'fir_tree').setSize(12, 10).setOffset(25, 54).setDepth(this.scene_settings.treeSpriteDepth) });
    level_1.birchTree.forEach(obj => { walls.create(obj.x * 32, obj.y * 32, 'birch_tree').setSize(16, 12).setOffset(26, 46).setDepth(this.scene_settings.treeSpriteDepth) });

    // things
    level_1.bench.forEach(obj => { walls.create(obj.x * 32, obj.y * 32 - 16, 'bench') });
    level_1.lightPost.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 8, 'light_post').setSize(14, 16).setOffset(10, 46).setDepth(this.scene_settings.wallSpriteDepth) });
    level_1.sign.forEach(obj => { walls.create(obj.x * 32 - 16, obj.y * 32 - 16, 'sign') });

    // wall collider
    this.physics.add.collider(walls, [gameState.player]);

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
        (this.healthVal + this.scene_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += this.scene_settings.boneHealthRegen;

        // play bone audio
        audioPlaying ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // coins
    this.collectables = this.physics.add.group();
    this.scene_settings.coins.forEach(coin => { this.collectables.create(coin.x * 32 - 16, coin.y * 32 - 16, 'coin').setCircle(15, 1, 0) });
    this.collectables.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        this.bonusScore += this.scene_settings.coinScoreBonus;
        gameState.coinCount += 1; // @TODO
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
    this.physics.add.collider(this.moveable, [walls, this.semiWalls]);
    this.physics.add.collider(this.moveable, gameState.player, () => {
      if (recycleCollider) {
        const str = 'Bark';
        const message = this.add.text(
          this.scene_settings.canvasWidth / 2,
          this.scene_settings.canvasHeight - 40,
          str,
          { fontSize: 20, color: '#FF7A00' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);
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
    const enemiesPhysicsGroup = this.physics.add.group();
    this.scene_settings.enemy.forEach(function (obj) {
      enemiesPhysicsGroup.create(obj.x * 32 - 16, obj.y * 32 - 16, 's_catcher').setCollideWorldBounds(true) // s_catcher == spriteSheet
        .setData({
          "id": obj.id,
          "x": obj.x,
          "y": obj.y,
          "tweenX": obj.tweenX,
          "tweenY": obj.tweenY
        });
    }, this);
    this.physics.add.collider(enemiesPhysicsGroup, [enemiesPhysicsGroup, walls, this.moveable]);

    enemiesPhysicsGroup.getChildren().forEach(function (gameObj) {
      // X or Y axis tween
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: (gameObj.getData("x") * 32 + gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay
        });
      } else if (gameObj.getData("tweenY") !== 0) {
        this.tweens.add({
          targets: gameObj,
          y: (gameObj.getData("y") * 32 + gameObj.getData("tweenY") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenY")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay
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
      frameRate: Math.round(this.scene_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: Math.round(this.scene_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'l_move',
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 2 }),
      frameRate: Math.round(this.scene_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(this.scene_settings.moveSpeed / 40),
      repeat: -1
    });
  }

  update() {
    // player drag over semiWalls
    if (gameState.player) {
      this.physics.overlap(gameState.player, this.semiWalls) ?
        gameState.player.setDamping(true).setDrag(0.6).setMaxVelocity(50) :
        gameState.player.setDamping(false).setDrag(1).setMaxVelocity(this.scene_settings.moveSpeed);
    }

    this.dangerState = false;
    const distanceCalc = gameFunctions.distanceCalc;

    this.tweens.getAllTweens().forEach(tween => {
      const gameObj = tween.targets[0];

      // ignores text tweens
      if (gameObj.type === "Sprite") {
        tween.isPlaying() ? gameObj.anims.play('s_catcher', true) : gameFunctions.biDirectional_enemy(gameObj, 's_catcher');

        if (this.physics.overlap(gameState.player, gameObj)) {
          gameObj.setVelocityX(0).setVelocityY(0);
          if (this.healthVal > 0) {
            this.healthVal -= this.scene_settings.enemyHealthReduction;
            this.dangerState = true;
          } else {
            this.HealthVal = -1;
          }
        } else if (distanceCalc(gameState.player, gameObj) < this.scene_settings.enemyChaseDistance) {
          tween.pause();
          this.physics.moveToObject(gameObj, gameState.player, this.scene_settings.enemyMoveSpeed);
          this.dangerState = true;
        } else {
          if (Math.round(gameObj.x) === gameObj.getData("x") * 32 - 16 && Math.round(gameObj.y) === gameObj.getData("y") * 32 - 16) {
            tween.play();
          } else {
            this.physics.moveTo(gameObj, gameObj.getData("x") * 32 - 16, gameObj.getData("y") * 32 - 16);
          }
        }

        // enemy drag over semiWalls
        this.physics.overlap(gameObj, this.semiWalls) ?
          gameObj.setDamping(true).setDrag(0.1).setMaxVelocity(20) :
          gameObj.setDamping(false).setDrag(1).setMaxVelocity(this.scene_settings.enemyMoveSpeed);
      }
    });

    // health check
    if (this.healthVal > 0) {
      this.healthVal = gameFunctions.control(gameState, this.scene_settings, this.healthVal);
      gameFunctions.activeHealthTextures(gameState, this.healthVal);

      // update score
      this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);

      // danger_bgm emitter @DISABLED
      // this.dangerState ? gameState.emitter.emit('danger_bgm_play') : gameState.emitter.emit('danger_bgm_stop');
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      // this.physics.pause();
      // this.anims.pauseAll();
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }

}