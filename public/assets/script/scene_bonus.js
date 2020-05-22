'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 24, 2020
 * @note bonus level
 * @TODO tile extruder
 */
class Scene_bonus extends Phaser.Scene {
  constructor() { super({ key: 'Scene_bonus' }) }

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
      introText: 'Bonus',

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 48,
      worldHeight: 32 * 48,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      playerSpawnPosition: [0, 1],
      familySpawnPosition: [47, 0],

      levelTime: 200, // s
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      backgroundDepth: -1,
      wallSpriteDepth: 1,
      playerSpriteDepth: 2,
      faceSpriteDepth: 2,
      scoreTimerBackgroundDepth: 4,
      scoreTextDepth: 5,
      healthBarDepth: 5,
      deathBackgroundMaskDepth: 6,
      deathBackgroundUnmaskDepth: 7,
      messageDepth: 10,
      buttonDepth: 10
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);
    gameFunctions.loadPlayerSpritesheet.apply(this);

    this.load.audio('scene_1_bgm', './assets/bgm/Zain_bgm_01.mp3');
    this.load.audio('success_audio', './assets/bgm/clips/Meme_success.mp3');
    // this.load.audio('danger_audio', './assets/bgm/Meme_action.mp3');
    this.load.audio('death_audio', './assets/bgm/Zain_death.mp3');
    // this.load.audio('bone_audio', './assets/bgm/clips/Zain_bone.mp3');
    this.load.audio('death_event_audio', './assets/bgm/clips/Zain_death_clip.mp3');

    this.load.image('back_button', './assets/sprites/buttons/button_back.png');
    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');

    this.load.image('girl', './assets/sprites/family/girl.png');
    this.load.image('face', './assets/sprites/testing/face.png');

    // tilemap and tileset
    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.tilemapTiledJSON('level_bonus_tilemap', './assets/tilemaps/level_bonus.json');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);
    this.physics.world.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);

    // level title
    this.levelText = this.add.text(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2,
      this.scene_settings.levelText,
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    // control (cursors need to be recreated per scene)
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      this.scene_settings.playerSpawnPosition[0] * 32,
      this.scene_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(this.scene_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true).setBounce(1);
    gameState.player.noStop = true;

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
    this.score = parseInt(this.levelTime * this.healthVal);
    this.scoreText = this.add.text(
      this.scene_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.scoreTextDepth);

    // scene transition
    this.girl = this.physics.add.sprite(this.scene_settings.familySpawnPosition[0] * 32, this.scene_settings.familySpawnPosition[1] * 32, 'girl').setOrigin(0);
    this.physics.add.overlap(gameState.player, this.girl, () => {
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
      this.scene.stop(this.scene.key);
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

    // ------ map ------ //
    const map = this.add.tilemap('level_bonus_tilemap'),
      tileSet = map.addTilesetImage('level_1');

    map.createStaticLayer('background', [tileSet], 0, 0).setDepth(this.scene_settings.backgroundDepth);
    const collider = map.createStaticLayer('collider', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    const coins = map.createFromObjects('coins', 27, { key: "face" }); // used coins layer to represent face (gid = 27)

    // collider.setCollisionByProperty({ collide: true });

    const walls = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, collider, walls, false);
    this.physics.add.collider(gameState.player, walls);

    const facePhysicsGroup = this.physics.add.group();
    coins.forEach(gameObj => { facePhysicsGroup.add(gameObj) });
    facePhysicsGroup.getChildren().forEach(gameObj => {
      gameObj.body.setCircle(14).setOffset(1, 1);
      gameObj.body.setVelocity(Phaser.Math.Between(50, 100), Phaser.Math.Between(50, 100)).setMaxVelocity(150).setMass(3).setBounce(1).setCollideWorldBounds(true);
      gameObj.setDepth(this.scene_settings.faceSpriteDepth);
      Math.random() > 0.5 ? gameObj.body.velocity.x *= -1 : gameObj.body.velocity.y *= -1;
    });
    this.physics.add.collider(facePhysicsGroup, [walls, facePhysicsGroup]);
    this.physics.add.collider(facePhysicsGroup, gameState.player, () => { this.cameras.main.shake(200, 0.01, false) });
    // ------ map ------ //

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 500,
      seek: 0,
      loop: true,
      delay: 0
    },
      sceneBGM = this.sound.add('scene_1_bgm', sound_config),
      deathBGM = this.sound.add('death_audio', sound_config),
      deathClip = this.sound.add('death_event_audio', sound_config.loop = false);

    this.sound.pauseOnBlur = false;

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      this.audioToggle = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (this.healthVal > 0 && !deathBGM.isPaused) {
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

    // emitter for time
    gameState.emitter.once('end_time', () => {
      this.endTime = this.time.now;
      this.scene_time_raw = this.endTime - this.startTime;
    }, this)

    this.audioToggle === true ? gameState.emitter.emit('play_bgm') : null;

    // audio button
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

  animate() { gameFunctions.animatePlayerSpritesheet.apply(this) }

  update() {
    if (this.healthVal > 0) {
      this.healthVal = gameFunctions.control(gameState, this.scene_settings, this.healthVal);
      gameFunctions.activeHealthTextures(gameState, this.healthVal);

      this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      this.physics.pause();
      gameState.player.anims.pause();
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }
}