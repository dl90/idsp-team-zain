'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 10, 2020
 * @note office theme
 */
class Scene_3 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_3' }) }

  init(data) {
    if (data) {
      this.forwardData = data;

      data.scene ? this.playerScene = data.scene : null;
      data.score ? this.playerScore = data.score : null;
      data.bonus > 0 ? this.playerBonus = data.bonus : this.playerBonus = 0;
      data.health ? this.playerHealth = data.health : null;
      data.time_raw ? this.playerTime_raw = data.time_raw : null;
      typeof data.audioToggle === 'boolean' ? this.audioToggle = data.audioToggle : this.audioToggle = true;
    }

    this.scene_settings = {
      debug: false,
      introText: 'Level 3',

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 80,
      worldHeight: 32 * 80,

      levelTime: 350,
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      playerSpawnPosition: [0, 3],
      familySpawnPosition: [79, 79],

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      enemyMoveSpeed: 85,
      enemyChaseDistance: 100,
      enemyHealthReduction: 0.1, // per 16ms
      enemyTweenDurationMultiplier: 500,
      enemyTweenLoopDelay: 20000,

      backgroundDepth: -1,
      wallSpriteDepth: 1,
      playerSpriteDepth: 2,
      enemySpriteDepth: 2,
      itemSpriteDepth: 2,
      treeSpriteDepth: 3,
      scoreTimerBackgroundDepth: 4,
      scoreTextDepth: 5,
      healthBarDepth: 5,
      deathBackgroundMaskDepth: 6,
      deathBackgroundUnmaskDepth: 7,
      messageDepth: 10,
      storyMaskDepth: 11,
      storyVideoDepth: 12,
      buttonDepth: 13,

      enemy: [
        { "id": 1, "x": -28, "y": -15, "tweenX": 0, "tweenY": -7 },
        { "id": 2, "x": 7, "y": -28, "tweenX": -10, "tweenY": 0 },
        { "id": 3, "x": 8, "y": -1, "tweenX": 0, "tweenY": 7 },
        { "id": 4, "x": -24, "y": 12, "tweenX": 7, "tweenY": 0 },
        { "id": 5, "x": -4, "y": 26, "tweenX": 0, "tweenY": 7 },
        { "id": 6, "x": 40, "y": 25, "tweenX": 0, "tweenY": -7 }
      ]
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);
    gameFunctions.loadPlayerSpritesheet.apply(this);
    gameFunctions.loadCommonButtons.apply(this);
    gameFunctions.loadCommonAudio.apply(this);

    this.load.spritesheet('s_catcher', './assets/sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('father', './assets/sprites/family/father.png');
    this.load.image('office_chair', './assets/sprites/office/desk_chair.png');
    this.load.image('coin', './assets/sprites/items/coin.png');
    this.load.image('bone', './assets/sprites/items/bone.png');

    //story
    this.load.image('story_1', '/assets/sprites/story/scene_3.1.png');
    this.load.image('story_2', '/assets/sprites/story/scene_3.2.png');
    this.load.image('story_3', '/assets/sprites/story/scene_3.3.png');
    this.load.image('next_button', '/assets/sprites/buttons/button_next.png');

    // tilemap and tileset
    this.load.image('office_tileset', './assets/tileset/Office_Tileset.png');
    this.load.image('things', './assets/tileset/things.png');
    this.load.tilemapTiledJSON('level_3', './assets/tilemaps/level_3.json');

    this.load.video('office_1', '/assets/video/theme_2_office/office_1.mp4');
    this.load.video('office_2', '/assets/video/theme_2_office/office_2.mp4');
    this.load.video('office_3', '/assets/video/theme_2_office/office_3.mp4');
    this.load.image('next_button', '/assets/sprites/buttons/button_next.png');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);
    this.physics.world.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);

    // --- story block --- //
    const introMask = this.add.rectangle(
      this.camera.centerX - 10,
      this.camera.centerY - 10,
      this.camera.displayWidth + 20,
      this.camera.displayHeight + 20).setFillStyle(0x000000, 1).setScrollFactor(0).setDepth(this.scene_settings.storyMaskDepth),

      story_1 = this.add.video(0, 0, 'office_1'),
      story_2 = this.add.video(0, 0, 'office_2'),
      story_3 = this.add.video(0, 0, 'office_3'),
      nextButton = this.add.image(this.scene_settings.canvasWidth - 30, this.scene_settings.canvasHeight / 2, 'next_button')
        .setInteractive().setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setAlpha(0.5);

    story_1.setOrigin(0).setVisible(true).setDepth(this.scene_settings.storyVideoDepth).setInteractive().setAlpha(0).setScrollFactor(0);
    story_2.setOrigin(0).setVisible(false).setDepth(this.scene_settings.storyVideoDepth).setInteractive().setAlpha(1).setScrollFactor(0);
    story_3.setOrigin(0).setVisible(false).setDepth(this.scene_settings.storyVideoDepth).setInteractive().setAlpha(1).setScrollFactor(0);

    this.tweens.add({
      targets: story_1,
      duration: 500,
      alpha: 1,
      onComplete: () => { story_1.play() }
    })

    let [story_arr, i] = [[story_1, story_2, story_3], 1];
    nextButton.on('pointerover', () => { nextButton.alpha = 1 });
    nextButton.on('pointerout', () => { nextButton.alpha = 0.5 });
    nextButton.on('pointerup', () => {
      i > 0 ? story_arr[i - 1].setVisible(false).stop() : null;

      if (i < story_arr.length) {
        story_arr[i].setVisible(true);
        story_arr[i].play();
        i++
      } else {
        story_arr[i - 1].setVisible(false); nextButton.setVisible(false)

        this.tweens.add({
          targets: introMask,
          duration: 4000,
          fillAlpha: 0,
          onComplete: () => {
            introMask.destroy();
            nextButton.destroy();
            story_arr.forEach(ref => ref.destroy());
          }
        });
      }
    });

    // skip story key
    const escape_1 = this.input.keyboard.addKey('ENTER'),
      escape_2 = this.input.keyboard.addKey('SPACE'),
      escape_3 = this.input.keyboard.addKey('ESC'),
      skipFunc = () => {
        story_arr.forEach(ref => { ref.stop().setVisible(false) });
        nextButton.destroy();
        this.tweens.add({
          targets: introMask,
          duration: 4000,
          fillAlpha: 0,
          onComplete: () => { introMask.destroy() }
        });
      };

    escape_1.on('down', skipFunc);
    escape_2.on('down', skipFunc);
    escape_3.on('down', skipFunc);

    this.levelText = this.add.text(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2,
      this.scene_settings.introText,
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      this.scene_settings.playerSpawnPosition[0] * 32,
      this.scene_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(this.scene_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true).setBounce(1);

    [this.bonusScore, this.coinCount, this.healthVal] = [0, 0, this.playerHealth];
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(this.scene_settings.healthBarDepth);
    this.scene_settings.debug ? this.healthVal = 1000 : null;

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    // time tracker
    this.levelTime = this.scene_settings.levelTime;
    this.add.rectangle(this.scene_settings.canvasWidth / 2 + 70, 10, 260, 15)
      .setFillStyle(0xffffff, 0.5).setScrollFactor(0).setDepth(this.scene_settings.scoreTimerBackgroundDepth);
    this.timeText = this.add.text(
      this.scene_settings.canvasWidth / 2, 10,
      `Level time: ${this.levelTime}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    // score tracker
    this.score = parseInt(this.levelTime * this.healthVal);
    this.scoreText = this.add.text(
      this.scene_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.scoreTextDepth);

    // scene transition
    this.father = this.physics.add.sprite(
      this.scene_settings.familySpawnPosition[0] * 32,
      this.scene_settings.familySpawnPosition[1] * 32,
      'father'
    ).setOrigin(0).setDepth(this.scene_settings.playerSpriteDepth);
    this.physics.add.overlap(gameState.player, this.father, () => {
      this.sound.pauseAll();

      gameState.emitter.emit('end_time');
      this.audioToggle ? this.sound.play('success_audio') : null

      this.cumulativeScore = this.playerScore + this.score;

      const forwardData = {
        "scene": this.scene.key,
        "score": this.score,
        "bonus": this.bonusScore,
        "health": this.healthVal,
        "time_raw": this.scene_time_raw,
        "audioToggle": this.audioToggle
      }
      this.scene.stop();
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

    // ------ map ------ //
    const map = this.add.tilemap('level_3'),
      tileSet = map.addTilesetImage('office_level_1', 'office_tileset'),
      things = map.addTilesetImage('things');

    // background
    map.createStaticLayer('background', [tileSet], 0, 0).setDepth(this.scene_settings.backgroundDepth);

    // static physics group
    const staticBodyPhysicsGroup = this.physics.add.staticGroup();

    // wall
    const wall = map.createStaticLayer('wall', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, wall, staticBodyPhysicsGroup, false);
    // coffee_counter
    const counter = map.createStaticLayer('coffee_counter', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, counter, staticBodyPhysicsGroup, false);
    // desk
    const desk = map.createStaticLayer('desk', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, desk, staticBodyPhysicsGroup, false);
    // printer
    const printer = map.createStaticLayer('printer', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, printer, staticBodyPhysicsGroup, false);
    // trash_bin
    const trash_bin = map.createStaticLayer('trash_bin', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, trash_bin, staticBodyPhysicsGroup, false);
    // water_cooler
    const water_cooler = map.createStaticLayer('water_cooler', [tileSet], 0, 0).setDepth(this.scene_settings.treeSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, water_cooler, staticBodyPhysicsGroup, false);
    // bookshelf
    const bookshelf = map.createStaticLayer('bookshelf', [tileSet], 0, 0).setDepth(this.scene_settings.treeSpriteDepth);
    gameFunctions.hitBoxGenerator(tileSet, bookshelf, staticBodyPhysicsGroup, false);

    this.physics.add.collider(gameState.player, staticBodyPhysicsGroup);

    // chair (moveable)
    const chair = map.createStaticLayer('chair', [tileSet], 0, 0).setVisible(false);
    const chairPhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(tileSet, chair, chairPhysicsGroup, true);
    chairPhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('office_chair').setInteractive().setCollideWorldBounds(true).setDamping(true).setDrag(0.2).setMaxVelocity(30).setMass(3).setSize(24, 18).setOffset(4, 6);
    });
    let chairCollider = true
    this.physics.add.collider(chairPhysicsGroup, [chairPhysicsGroup, staticBodyPhysicsGroup]);
    this.physics.add.collider(chairPhysicsGroup, gameState.player, () => {
      if (chairCollider) {
        const message = this.add.text(
          this.scene_settings.canvasWidth / 2,
          this.scene_settings.canvasHeight - 30,
          'Wolf',
          { fontSize: 16, color: '#FF7A00' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);
        this.tweens.add({
          targets: message,
          alpha: 0,
          duration: 1000,
          loop: 2,
          ease: 'Linear',
          yoyo: false,
          onComplete: () => { message.destroy(); chairCollider = true }
        });
        chairCollider = false;
      }
    });

    // coin
    const coin = map.createStaticLayer('coin', [things], 0, 0).setVisible(false);
    const coinPhysicsGroup = this.physics.add.group();
    coin.forEachTile(tile => {
      const tileWorldPos = coin.tileToWorldXY(tile.x, tile.y);
      if (tile.properties.coin) {
        coinPhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'coin').setCircle(30 / 2, 1, 1).setDepth(this.scene_settings.itemSpriteDepth);
      }
    });
    coinPhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        this.bonusScore += this.scene_settings.coinScoreBonus;
        this.coinCount += 1;
        gameObj.destroy();
      });
    });

    // bone
    const bone = map.createStaticLayer('bone', [things], 0, 0).setVisible(false);
    const bonePhysicsGroup = this.physics.add.group();
    bone.forEachTile(tile => {
      const tileWorldPos = bone.tileToWorldXY(tile.x, tile.y);
      if (tile.properties.bone) {
        bonePhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'bone').setCircle(5, 10, 10).setDepth(this.scene_settings.itemSpriteDepth);
      }
    });
    bonePhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (this.healthVal + this.scene_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += this.scene_settings.boneHealthRegen;

        this.audioToggle ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    const enemyPhysicsGroup = this.physics.add.group();
    this.scene_settings.enemy.forEach(function (obj) {
      let face = false
      obj.tweenX < 0 || obj.tweenY < 0 ? face = true : null;
      const enemy = enemyPhysicsGroup.create((obj.x + 32) * 32 + 16, (obj.y + 32) * 32 + 16, 's_catcher').setCollideWorldBounds(true)
        .setData({
          "id": obj.id,
          "x": obj.x + 32,
          "y": obj.y + 32,
          "tweenX": obj.tweenX,
          "tweenY": obj.tweenY
        }).setDepth(this.scene_settings.enemySpriteDepth);
      enemy.flipX = face;
    }, this);
    this.physics.add.collider(enemyPhysicsGroup, [enemyPhysicsGroup, staticBodyPhysicsGroup, chairPhysicsGroup]);

    enemyPhysicsGroup.getChildren().forEach(function (gameObj) {
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: (gameObj.getData("x") * 32 + gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay,
          onYoyo: () => { gameObj.flipX ? gameObj.flipX = false : gameObj.flipX = true },
          onRepeat: () => { gameObj.flipX ? gameObj.flipX = false : gameObj.flipX = true }
        });
      } else if (gameObj.getData("tweenY") !== 0) {
        this.tweens.add({
          targets: gameObj,
          y: (gameObj.getData("y") * 32 + gameObj.getData("tweenY") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenY")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay,
          onYoyo: () => { gameObj.flipX ? gameObj.flipX = false : gameObj.flipX = true },
          onRepeat: () => { gameObj.flipX ? gameObj.flipX = false : gameObj.flipX = true }
        });
      }
    }, this);

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    },
      sceneBGM = this.sound.add('scene_1_bgm', sound_config),
      deathBGM = this.sound.add('death_audio', sound_config),
      dangerBGM = this.sound.add('danger_audio', sound_config),
      boneClip = this.sound.add('bone_audio', sound_config.loop = false),
      deathClip = this.sound.add('death_event_audio', sound_config.loop = false);

    this.sound.pauseOnBlur = false;
    let danger_bgm_toggle = true;

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      this.audioToggle = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (this.dangerState && dangerBGM.isPaused) {
        dangerBGM.resume();
      } else if (this.healthVal > 0 && !deathBGM.isPaused) {
        sceneBGM.isPaused ? sceneBGM.resume() : sceneBGM.play();
      } else {
        deathBGM.isPaused ? deathBGM.resume() : deathBGM.play();
      }
      this.audioToggle = true
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
      if (this.audioToggle) {
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
      if (danger_bgm_toggle && this.audioToggle) {
        sceneBGM.pause();
        dangerBGM.setVolume(0).play();
        this.tweens.add({
          targets: dangerBGM,
          volume: 0.8,
          duration: 1000,
        });
        danger_bgm_toggle = false
        this.audioToggle = true
      }
    }, this);
    gameState.emitter.on('danger_bgm_stop', () => {
      if (!danger_bgm_toggle && this.audioToggle) {
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
    [this.started, this.ended] = [false, false];
    gameState.emitter.once('start_time', () => {
      this.startTime = this.time.now;
      this.tweens.add({
        targets: this.levelText,
        duration: 1000,
        alpha: 0,
        onComplete: () => { this.levelText.destroy() }
      });
      this.time.addEvent({
        delay: 1000,
        repeat: -1,
        callbackScope: this,
        callback: () => {
          if (this.healthVal > 0 && this.levelTime > 0) {
            this.levelTime--;
            this.timeText.setText(`Level time: ${this.levelTime}`);
          }
        }
      });
    }, this);
    gameState.emitter.once('end_time', () => {
      this.endTime = this.time.now;
      this.scene_time_raw = this.endTime - this.startTime;
    }, this);

    this.audioToggle === true ? gameState.emitter.emit('play_bgm') : null;

    // buttons
    const audioButton = this.add.sprite(
      this.scene_settings.canvasWidth - 20,
      this.scene_settings.canvasHeight - 20,
      this.audioToggle ? 'audio_button_on' : 'audio_button_off')
      .setScale(0.5).setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setInteractive().setAlpha(0.5);
    audioButton.on('pointerover', () => { audioButton.alpha = 1 });
    audioButton.on('pointerout', () => { audioButton.alpha = 0.5 });
    audioButton.on('pointerup', () => { this.audioToggle ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    this.backButton = this.add.sprite(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(this.scene_settings.buttonDepth).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => {
          this.sound.stopAll();
          this.forwardData.audioToggle = this.audioToggle;
          this.scene.restart(this.forwardData);
        }
      });
    });

    this.animate();
  }

  animate() {
    gameFunctions.animatePlayerSpritesheet.apply(this);
    this.anims.create({
      key: 's_catcher',
      frames: this.anims.generateFrameNumbers('s_catcher', { start: 0, end: 1 }),
      frameRate: Math.round(this.scene_settings.moveSpeed / 40),
      repeat: -1
    });
  }

  update() {
    this.dangerState = false;
    this.tweens.getAllTweens().forEach(tween => {
      const gameObj = tween.targets[0];
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
        } else if (gameFunctions.distanceCalc(gameState.player, gameObj) < this.scene_settings.enemyChaseDistance) {
          tween.pause();
          this.physics.moveToObject(gameObj, gameState.player, this.scene_settings.enemyMoveSpeed);
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
      this.healthVal = gameFunctions.control(gameState, this.scene_settings, this.healthVal);
      gameFunctions.activeHealthTextures(gameState, this.healthVal);

      if (gameState.cursors.up.isDown || gameState.cursors.down.isDown || gameState.cursors.left.isDown || gameState.cursors.right.isDown) {
        !this.started ? (() => { gameState.emitter.emit('start_time'); this.started = true })() : null;
      }

      if (this.levelTime > 0) {
        this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
        this.scoreText.setText(`Score: ${this.score}`);
      } else {
        this.score = 1;
        this.scoreText.setText(`Score: ${this.score}`);
      }
      // this.dangerState ? gameState.emitter.emit('danger_bgm_play') : gameState.emitter.emit('danger_bgm_stop');
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      !this.ended ? (() => { gameState.emitter.emit('end_time'); this.ended = true })() : null;
      this.physics.pause();
      gameState.player.anims.pause();
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }
}