'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 11, 2020
 */
class Scene_11 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_11' }) }

  init(data) {
    if (data) {
      this.playerScene = data.scene;
      this.playerScore = data.score;
      this.playerBonus = data.bonus;
      this.playerHealth = data.health;
      this.playerTime_raw = data.time_raw;
      this.forwardData = data;
    }

    this.scene_11_settings = {
      debug: true,

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 99,
      worldHeight: 32 * 99,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      playerSpawnPosition: [0, 0],
      familySpawnPosition: [95, 96],

      levelTime: 400, // s
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      backgroundDepth: -1,
      wallSpriteDepth: 1,
      playerSpriteDepth: 2,
      itemSpriteDepth: 2,
      wallDecorSpriteDepth: 3,
      scoreTimerBackgroundDepth: 4,
      scoreTextDepth: 5,
      healthBarDepth: 5,
      deathBackgroundMaskDepth: 6,
      deathBackgroundUnmaskDepth: 7,
      messageDepth: 10,
      buttonDepth: 10,

      enemyMoveSpeed: 85,
      enemyChaseDistance: 100,
      enemyHealthReduction: 0.1, // per 16ms
      enemyTweenDurationMultiplier: 500,
      enemyTweenLoopDelay: 20000,

      enemy: [
        { "id": 1, "x": 12, "y": 8, "tweenX": 7, "tweenY": 0 },
        { "id": 2, "x": 33, "y": 18, "tweenX": 0, "tweenY": 7 },
        { "id": 3, "x": 14, "y": 25, "tweenX": 0, "tweenY": 7 },
        { "id": 4, "x": 10, "y": 56, "tweenX": 0, "tweenY": 7 },
        { "id": 5, "x": 11, "y": 77, "tweenX": 0, "tweenY": 7 },
        { "id": 6, "x": 40, "y": 77, "tweenX": 0, "tweenY": 7 },
        { "id": 7, "x": 74, "y": 8, "tweenX": 0, "tweenY": 7 },
        { "id": 8, "x": 89, "y": 20, "tweenX": 0, "tweenY": 7 },
        { "id": 9, "x": 64, "y": 38, "tweenX": 7, "tweenY": 0 },
        { "id": 10, "x": 97, "y": 48, "tweenX": 0, "tweenY": 7 },
        { "id": 11, "x": 89, "y": 78, "tweenX": 0, "tweenY": 7 },
        { "id": 12, "x": 61, "y": 91, "tweenX": 7, "tweenY": 0 }
      ]
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

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

    this.load.image('girl', './assets/sprites/family/girl.png');
    this.load.image('coin', './assets/sprites/items/coin.png');
    this.load.image('bone', './assets/sprites/items/bone.png');
    this.load.image('chair', './assets/sprites/classroom/chair.png');

    // tilemap and tileset
    this.load.image('ClassRoom', './assets/tileset/Group 12.png');
    this.load.tilemapTiledJSON('tilemap', './assets/tilemaps/level_11.json');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null;
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null;
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null;

    this.camera = this.cameras.main.setBounds(0, 0, this.scene_11_settings.worldWidth, this.scene_11_settings.worldHeight);
    this.physics.world.setBounds(0, 0, this.scene_11_settings.worldWidth, this.scene_11_settings.worldHeight);

    // level title
    this.levelText = this.add.text(
      this.scene_11_settings.canvasWidth / 2,
      this.scene_11_settings.canvasHeight / 2,
      'Level 11',
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_11_settings.messageDepth);

    // control (cursors need to be recreated per scene)
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      this.scene_11_settings.playerSpawnPosition[0] * 32,
      this.scene_11_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(this.scene_11_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true).setBounce(1);

    // healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(this.scene_11_settings.healthBarDepth);
    this.scene_11_settings.debug ? this.healthVal = 1000 : this.healthVal = this.playerHealth; // gets health from passed value
    [this.bonusScore, this.coinCount] = [0, 0];

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    // time tracker
    this.levelTime = this.scene_11_settings.levelTime;
    this.add.rectangle(this.scene_11_settings.canvasWidth / 2 + 70, 10, 260, 15)
      .setFillStyle(0xffffff, 0.5).setScrollFactor(0).setDepth(this.scene_11_settings.scoreTimerBackgroundDepth);
    this.timeText = this.add.text(
      this.scene_11_settings.canvasWidth / 2, 10,
      `Level time: ${this.levelTime}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_11_settings.messageDepth);

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

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (this.healthVal > 0) {
            this.levelTime--;
            this.timeText.setText(`Level time: ${this.levelTime}`);
          }
        },
        callbackScope: this,
        repeat: -1
      });
    }, this);

    // score tracker
    this.score = parseInt(this.levelTime * this.healthVal); // @TODO scene score || total score
    this.scoreText = this.add.text(
      this.scene_11_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_11_settings.scoreTextDepth);

    // scene transition
    this.boy = this.physics.add.sprite(
      this.scene_11_settings.familySpawnPosition[0] * 32,
      this.scene_11_settings.familySpawnPosition[1] * 32,
      'girl'
    ).setOrigin(0).setDepth(this.scene_11_settings.playerSpriteDepth);
    this.physics.add.overlap(gameState.player, this.boy, () => {
      this.sound.pauseAll();

      // timer (end of scene)
      gameState.emitter.emit('end_time');
      audioPlaying ? this.sound.play('success_audio') : null

      // @TODO
      this.cumulativeScore = this.playerScore + this.score;

      // forwarded data
      const forwardData = {
        scene: this.scene.key,
        score: this.score,
        bonus: this.bonusScore,
        health: this.healthVal,
        time_raw: this.scene_4_time_raw
      }
      this.scene.stop(this.scene.key);
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

    // ------ map ------ //
    const map = this.add.tilemap('tilemap'),
      classroom = map.addTilesetImage('ClassRoom');

    map.createStaticLayer('background', [classroom], 0, 0).setDepth(this.scene_11_settings.backgroundDepth);

    // blue_floor
    map.createStaticLayer('blue_floor', [classroom], 0, 0).setDepth(this.scene_11_settings.backgroundDepth);

    // chalkboard_wall
    const chalkboard_wall = map.createStaticLayer('chalkboard_wall', [classroom], 0, 0).setDepth(this.scene_11_settings.wallSpriteDepth);
    const chalkboard_wallPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(classroom, chalkboard_wall, chalkboard_wallPhysicsGroup, false);
    this.physics.add.collider(gameState.player, chalkboard_wallPhysicsGroup);

    // chalkboard
    map.createStaticLayer('chalkboard', [classroom], 0, 0).setDepth(this.scene_11_settings.wallDecorSpriteDepth);

    // divider
    const divider = map.createStaticLayer('divider', [classroom], 0, 0).setDepth(this.scene_11_settings.wallSpriteDepth);
    const dividerPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(classroom, divider, dividerPhysicsGroup, false);
    this.physics.add.collider(gameState.player, dividerPhysicsGroup);

    // clock
    map.createStaticLayer('clock', [classroom], 0, 0).setDepth(this.scene_11_settings.wallDecorSpriteDepth);

    // flower_poster
    map.createStaticLayer('flower_poster', [classroom], 0, 0).setDepth(this.scene_11_settings.wallDecorSpriteDepth);

    // heart_poster
    map.createStaticLayer('heart_poster', [classroom], 0, 0).setDepth(this.scene_11_settings.wallDecorSpriteDepth);

    // front_desk
    const front_desk = map.createStaticLayer('front_desk', [classroom], 0, 0).setDepth(this.scene_11_settings.wallSpriteDepth);
    const front_deskPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(classroom, front_desk, front_deskPhysicsGroup, false);
    this.physics.add.collider(gameState.player, front_deskPhysicsGroup);

    // boxes
    const boxes = map.createStaticLayer('boxes', [classroom], 0, 0).setDepth(this.scene_11_settings.wallSpriteDepth);
    const boxesPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(classroom, boxes, boxesPhysicsGroup, false);
    this.physics.add.collider(gameState.player, boxesPhysicsGroup);

    // class_desk
    const class_desk = map.createStaticLayer('class_desk', [classroom], 0, 0).setDepth(this.scene_11_settings.wallSpriteDepth);
    const class_deskPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(classroom, class_desk, class_deskPhysicsGroup, false);
    this.physics.add.collider(gameState.player, class_deskPhysicsGroup);

    // class_chair (moveable)
    const class_chair = map.createStaticLayer('class_chair', [classroom], 0, 0).setVisible(false);
    const class_chairPhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(classroom, class_chair, class_chairPhysicsGroup, true);
    class_chairPhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('chair').setInteractive().setCollideWorldBounds(true).setDamping(true).setDrag(0.2).setMaxVelocity(30).setMass(3).setSize(21, 21);
    });
    let class_chairCollider = true
    this.physics.add.collider(class_chairPhysicsGroup, [class_chairPhysicsGroup, chalkboard_wallPhysicsGroup, dividerPhysicsGroup, front_deskPhysicsGroup, boxesPhysicsGroup, class_deskPhysicsGroup]);
    this.physics.add.collider(class_chairPhysicsGroup, gameState.player, () => {
      if (class_chairCollider) {
        const str = 'Wolf';
        const message = this.add.text(
          this.scene_11_settings.canvasWidth / 2,
          this.scene_11_settings.canvasHeight - 30,
          str,
          { fontSize: 16, color: '#FF7A00' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_11_settings.messageDepth);
        this.tweens.add({
          targets: message,
          alpha: 0,
          duration: 1000,
          loop: 2,
          ease: 'Linear',
          yoyo: false,
          onComplete: () => { message.destroy(); class_chairCollider = true }
        });
        class_chairCollider = false;
      }
    });

    // coin
    const coin = map.createStaticLayer('coin', [classroom], 0, 0).setVisible(false);
    const coinPhysicsGroup = this.physics.add.group();
    coin.forEachTile(tile => {
      const tileWorldPos = coin.tileToWorldXY(tile.x, tile.y);
      if (tile.properties.coin) {
        coinPhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'coin').setCircle(15, 1, 1).setDepth(this.scene_11_settings.itemSpriteDepth);
      }
    });
    coinPhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        this.bonusScore += this.scene_11_settings.coinScoreBonus;
        this.coinCount += 1; // @TODO
        gameObj.destroy();
      });
    });

    // bone
    const bone = map.createStaticLayer('bone', [classroom], 0, 0).setVisible(false);
    const bonePhysicsGroup = this.physics.add.group();
    bone.forEachTile(tile => {
      const tileWorldPos = bone.tileToWorldXY(tile.x, tile.y);
      if (tile.properties.bone) {
        bonePhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'bone').setCircle(5, 10, 10).setDepth(this.scene_11_settings.itemSpriteDepth);
      }
    });
    bonePhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (this.healthVal + this.scene_11_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += this.scene_11_settings.boneHealthRegen;

        // play bone audio
        audioPlaying ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // enemy
    const enemyPhysicsGroup = this.physics.add.group();
    this.scene_11_settings.enemy.forEach(function (obj) {
      enemyPhysicsGroup.create(obj.x * 32 + 16, obj.y * 32 + 16, 's_catcher').setCollideWorldBounds(true)
        .setData({
          "id": obj.id,
          "x": obj.x,
          "y": obj.y,
          "tweenX": obj.tweenX,
          "tweenY": obj.tweenY
        });
    }, this);
    enemyPhysicsGroup.getChildren().forEach(function (gameObj) {
      this.physics.add.collider(gameObj, [enemyPhysicsGroup, class_chairPhysicsGroup, chalkboard_wallPhysicsGroup, dividerPhysicsGroup, front_deskPhysicsGroup, boxesPhysicsGroup, class_deskPhysicsGroup]);

      // tween
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: (gameObj.getData("x") * 32 + gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * this.scene_11_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_11_settings.enemyTweenLoopDelay
        });
      } else if (gameObj.getData("tweenY") !== 0) {
        this.tweens.add({
          targets: gameObj,
          y: (gameObj.getData("y") * 32 + gameObj.getData("tweenY") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenY")) * this.scene_11_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_11_settings.enemyTweenLoopDelay
        });
      }
    }, this);
    // ------ map ------ //

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
      deathBGM = this.sound.add('death_audio', sound_config),
      dangerBGM = this.sound.add('danger_audio', sound_config),
      boneClip = this.sound.add('bone_audio', sound_config.loop = false),
      deathClip = this.sound.add('death_event_audio', sound_config.loop = false);

    this.sound.pauseOnBlur = false;
    let audioPlaying = true,
      danger_bgm_toggle = true;

    // audio button
    const audioButton = this.add.sprite(
      this.scene_11_settings.canvasWidth - 20,
      this.scene_11_settings.canvasHeight - 20,
      'audio_button_on').setScale(0.5).setScrollFactor(0).setDepth(this.scene_11_settings.buttonDepth).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

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
        this.scene_11_settings.canvasWidth / 2,
        this.scene_11_settings.canvasHeight / 2 - 50,
        'Game Over',
        { fontSize: 30, color: 'white' }).setScrollFactor(0).setOrigin(0.5).setDepth(this.scene_11_settings.messageDepth);
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
        this.camera.displayHeight + 20).setFillStyle(0x000000, 0.2).setScrollFactor(0).setDepth(this.scene_11_settings.deathBackgroundMaskDepth);
      this.tweens.add({
        targets: mask,
        duration: 4000,
        fillAlpha: 0.9
      });

      const unmask = this.add.circle(
        this.camera.centerX + this.camera.displayWidth / 2 - 20,
        this.camera.centerY + this.camera.displayHeight / 2 - 20,
        10
      ).setFillStyle(0xffffff, 0).setScrollFactor(0).setDepth(this.scene_11_settings.deathBackgroundUnmaskDepth);
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
      this.scene_3_time_raw = this.endTime - this.startTime;
    }, this)

    gameState.emitter.emit('play_bgm');

    this.backButton = this.add.sprite(
      this.scene_11_settings.canvasWidth / 2,
      this.scene_11_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(this.scene_11_settings.buttonDepth).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => {
          this.sound.stopAll();
          this.scene.restart(this.forwardData); // restarts scene with previously passed data
        }
      });
    });

    this.animate();
  }

  animate() {
    this.anims.create({
      key: 'f_move',
      frames: this.anims.generateFrameNumbers('f_dog', { start: 0, end: 2 }),
      frameRate: Math.round(this.scene_11_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: Math.round(this.scene_11_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'l_move',
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 2 }),
      frameRate: Math.round(this.scene_11_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(this.scene_11_settings.moveSpeed / 40),
      repeat: -1
    });
  }

  update() {
    this.dangerState = false;
    const distanceCalc = gameFunctions.distanceCalc;

    this.tweens.getAllTweens().forEach(tween => {
      const gameObj = tween.targets[0];
      if (gameObj.type === "Sprite") {
        tween.isPlaying() ? gameObj.anims.play('s_catcher', true) : gameFunctions.biDirectional_enemy(gameObj, 's_catcher');

        if (this.physics.overlap(gameState.player, gameObj)) {
          gameObj.setVelocityX(0).setVelocityY(0);
          if (this.healthVal > 0) {
            this.healthVal -= this.scene_11_settings.enemyHealthReduction;
            this.dangerState = true;
          } else {
            this.HealthVal = -1;
          }
        } else if (distanceCalc(gameState.player, gameObj) < this.scene_11_settings.enemyChaseDistance) {
          tween.pause();
          this.physics.moveToObject(gameObj, gameState.player, this.scene_11_settings.enemyMoveSpeed);
          this.dangerState = true;
        } else {
          if (Math.round(gameObj.x) === gameObj.getData("x") * 32 + 16 && Math.round(gameObj.y) === gameObj.getData("y") * 32 + 16) {
            tween.play();
          } else {
            this.physics.moveTo(gameObj, gameObj.getData("x") * 32 + 16, gameObj.getData("y") * 32 + 16);
          }
        }
      }
    });

    // health check
    if (this.healthVal > 0) {
      this.healthVal = gameFunctions.control(gameState, this.scene_11_settings, this.healthVal);
      gameFunctions.activeHealthTextures(gameState, this.healthVal);

      // update score
      this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);

      // danger_bgm emitter @DISABLED
      // this.dangerState ? gameState.emitter.emit('danger_bgm_play') : gameState.emitter.emit('danger_bgm_stop');
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }
}