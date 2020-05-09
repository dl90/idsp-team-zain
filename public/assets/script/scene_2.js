'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 24, 2020
 */

const scene_2_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 32 * 48,
  worldHeight: 32 * 48,

  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71,
  twoKeyMultiplier: 0.707,

  playerSpawnPosition: [1, 2],
  familySpawnPosition: [46, 1],
  levelTime: 300, // s

  backgroundDepth: -1,
  playerSpriteDepth: 1,
  wallSpriteDepth: 2,
  // treeSpriteDepth: 3,
  scoreTimerBackgroundDepth: 3,
  scoreTextDepth: 5,
  healthBarDepth: 5,
  deathBackgroundMaskDepth: 6,
  deathBackgroundUnmaskDepth: 7,
  messageDepth: 10,
  buttonDepth: 10
}

class Scene_2 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_2' }) }

  // data from previous scene
  init(data) {
    if (data) {
      this.playerScene = data.scene;
      this.playerScore = data.score;
      this.playerBonus = data.bonus;
      this.playerHealth = data.health;
      this.playerTime_raw = data.time_raw;
      this.forwardData = data;
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.spritesheet('f_dog', './assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.tilemapTiledJSON('scene_2', './assets/tilemaps/test_level_2.json');

    this.load.image('girl', './assets/sprites/family/girl.png');
    this.load.image('face', './assets/sprites/testing/face.png');

    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './assets/bgm/Zain_Game_Music.mp3');
    this.load.audio('success_audio', './assets/bgm/clips/Success.mp3');
    this.load.audio('death_audio', './assets/bgm/clips/Meme_death.mp3');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);

    // level title
    this.levelText = this.add.text(
      scene_1_settings.canvasWidth / 2,
      scene_1_settings.canvasHeight / 2,
      'Level 2',
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_2_settings.messageDepth);

    // control (cursors need to be recreated per scene)
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      scene_2_settings.playerSpawnPosition[0] * 32,
      scene_2_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setOrigin(0.5).setDepth(scene_2_settings.playerSpriteDepth);
    gameState.player.setCollideWorldBounds(true).setBounce(1);
    gameState.player.noStop = true;

    // healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(scene_2_settings.healthBarDepth);
    this.bonusScore = 0; // resetBonus

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    // time tracker
    this.levelTime = scene_2_settings.levelTime;
    this.add.rectangle(scene_1_settings.canvasWidth / 2 + 70, 10, 260, 15).setFillStyle(0xffffff, 0.5).setScrollFactor(0).setDepth(scene_2_settings.scoreTimerBackgroundDepth);
    this.timeText = this.add.text(
      scene_2_settings.canvasWidth / 2, 10,
      `Level time: ${this.levelTime}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_2_settings.messageDepth);

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
          if (gameState.healthVal > 0) {
            this.levelTime--;
            this.timeText.setText(`Level time: ${this.levelTime}`);
          }
        },
        callbackScope: this,
        repeat: -1
      });
    }, this);

    // score tracker
    this.score = parseInt(this.levelTime * gameState.healthVal); // @TODO scene score || total score
    this.scoreText = this.add.text(
      scene_2_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_2_settings.scoreTextDepth);

    // scene transition
    this.girl = this.physics.add.sprite(scene_2_settings.familySpawnPosition[0] * 32 - 16, scene_2_settings.familySpawnPosition[1] * 32 - 16, 'girl');
    this.physics.add.overlap(gameState.player, this.girl, () => {
      this.sound.pauseAll();

      // timer (end of scene)
      gameState.emitter.emit('end_time');

      this.sound.play('success_audio');
      this.scene.stop("Scene_2");

      // @TODO
      this.cumulativeScore = this.playerScore + this.score;

      // forwarded data
      const forwardData = {
        scene: 'Scene_2',
        score: this.score,
        bonus: this.bonusScore,
        health: gameState.healthVal,
        time_raw: this.scene_2_time_raw
      }
      this.scene.stop("Scene_2");
      this.scene.get("Level_transition").scene.restart(forwardData);
    })

    const map = this.add.tilemap('scene_2');
    const tileSet = map.addTilesetImage('level_1');

    map.createStaticLayer('background', [tileSet], 0, 0).setDepth(scene_2_settings.backgroundDepth);
    const collider = map.createStaticLayer('collider', [tileSet], 0, 0);
    const coins = map.createFromObjects('coins', 27, { key: "face" }); // used coins layer to represent face

    collider.setCollisionByProperty({ collide: true })

    const walls = this.physics.add.staticGroup();
    collider.forEachTile(tile => {
      const tileWorldPos = collider.tileToWorldXY(tile.x, tile.y),
        collisionGroup = tileSet.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return }
      else {
        const objects = collisionGroup.objects;
        objects.forEach((object) => {
          if (object.rectangle) {
            walls.create(tileWorldPos.x + 16, tileWorldPos.y + 16, null)
              .setSize(object.width, object.height).setOffset(object.x, object.y).setDepth(scene_2_settings.wallSpriteDepth).setVisible(false)
          }
        });
      }
    });
    this.physics.add.collider(gameState.player, walls);

    const face = this.physics.add.group();
    coins.forEach(gameObj => { face.add(gameObj) });
    face.getChildren().forEach(gameObj => {
      gameObj.body.setCircle(14).setOffset(1, 1);
      gameObj.body.setVelocity(Phaser.Math.Between(50, 100), Phaser.Math.Between(50, 100)).setMaxVelocity(150);
      gameObj.body.setBounce(1).setCollideWorldBounds(true).setMass(3);
      if (Math.random() > 0.5) {
        gameObj.body.velocity.x *= -1;
      }
      else {
        gameObj.body.velocity.y *= -1;
      }
    });
    this.physics.add.collider(face);
    this.physics.add.collider(face, [walls]);
    this.physics.add.collider(face, gameState.player, () => {
      this.cameras.main.shake(200, 0.01, false);
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
    const deathBGM = this.sound.add('death_audio', sound_config);
    this.sound.pauseOnBlur = false;
    let audioPlaying = true;

    // audio button
    const audioButton = this.add.sprite(
      scene_2_settings.canvasWidth - 20,
      scene_2_settings.canvasHeight - 20,
      'audio_button_on').setScale(0.5).setScrollFactor(0).setDepth(scene_2_settings.buttonDepth).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (gameState.healthVal > 0 && !deathBGM.isPaused) {
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
        scene_2_settings.canvasWidth / 2,
        scene_2_settings.canvasHeight / 2 - 50,
        'Game Over',
        { fontSize: 30, color: 'white' }).setScrollFactor(0).setOrigin(0.5).setDepth(scene_2_settings.messageDepth);
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
        this.camera.displayHeight + 20).setFillStyle(0x000000, 0.2).setScrollFactor(0).setDepth(scene_2_settings.deathBackgroundMaskDepth);
      this.tweens.add({
        targets: mask,
        duration: 4000,
        fillAlpha: 0.9
      });

      const unmask = this.add.circle(
        this.camera.centerX + this.camera.displayWidth / 2 - 20,
        this.camera.centerY + this.camera.displayHeight / 2 - 20,
        10
      ).setFillStyle(0xffffff, 0).setScrollFactor(0).setDepth(scene_2_settings.deathBackgroundUnmaskDepth);
      this.tweens.add({
        targets: unmask,
        duration: 4000,
        fillAlpha: 0.9
      });

      sceneBGM.pause();
      audioPlaying ? deathBGM.play() : null
    }, this);

    // emitter for time
    gameState.emitter.once('end_time', () => {
      this.endTime = this.time.now;
      this.scene_2_time_raw = this.endTime - this.startTime;
    }, this)

    gameState.emitter.emit('play_bgm');

    this.backButton = this.add.sprite(
      scene_2_settings.canvasWidth / 2,
      scene_2_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(scene_2_settings.buttonDepth).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => { this.scene.restart(this.forwardData) }
      });
    });

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
  }

  update() {
    if (gameState.healthVal > 0) {
      gameFunctions.control(gameState, scene_2_settings);
      gameFunctions.activeHealthTextures(gameState);

      // update score
      this.score = this.bonusScore + parseInt(this.levelTime * gameState.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      gameState.player.noStop = null;

      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }

}