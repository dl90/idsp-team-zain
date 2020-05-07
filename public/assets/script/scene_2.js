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
  enemyMoveSpeed: 85,
  enemyChaseDistance: 100,
  boneHealthRegen: 30,
  familySpawnPosition: [46, 3],

  enemy: [],
  enemyTweenDurationMultiplier: 500,
  enemyTweenLoopDelay: 20000
}
class Scene_2 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_2' }) }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.spritesheet('f_dog', './assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.tilemapTiledJSON('scene_2', './assets/tilemaps/test_level_2.json');

    this.load.image('girl_1', './assets/sprites/family/girl_1.png');
    this.load.image('face', './assets/sprites/testing/face.png');

    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');
    this.load.audio('scene_1_bgm', './assets/bgm/Meme_Scene_1.mp3');
    this.load.audio('success_audio', './assets/bgm/clips/Success.mp3');
    this.load.audio('death_audio', './assets/bgm/clips/Meme_death.mp3');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);

    this.levelText = this.add.text(scene_2_settings.canvasWidth / 2 - 50, scene_2_settings.canvasHeight / 2 - 50, 'Level 2', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
    this.time.delayedCall(5000, this.levelText.destroy());

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(scene_2_settings.playerSpawnPosition[0] * 32 - 16, scene_2_settings.playerSpawnPosition[1] * 32 - 16, 'f_dog').setSize(30, 30).setDepth(1);
    gameState.player.setCollideWorldBounds(true).setBounce(1);
    gameState.player.noStop = true;

    // readds healthBar 
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
    // gameState.healthVal = 100;

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    // time tracker
    this.levelTime = scene_1_settings.levelTime;
    this.timeText = this.add.text(scene_2_settings.canvasWidth / 2, 10, `Level time: ${this.levelTime}`, { fontSize: 12, color: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
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
    this.scoreText = this.add.text(scene_2_settings.canvasWidth / 2, 30, `Score: ${this.score}`, { fontSize: 12, color: '#ff0000' }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    // scene transition 
    this.girl_1 = this.physics.add.sprite(scene_2_settings.familySpawnPosition[0] * 32 - 16, scene_2_settings.familySpawnPosition[1] * 32 - 16, 'girl_1').setScale(0.5);
    this.physics.add.overlap(gameState.player, this.girl_1, () => {
      this.sound.pauseAll()

      // timer
      gameState.emitter.emit('end_time');

      this.sound.play('success_audio');
      this.scene.stop("Scene_2");
      this.scene.start("ScoreBoard");
    })

    const map = this.add.tilemap('scene_2');
    const tileSet = map.addTilesetImage('level_1');

    map.createStaticLayer('background', [tileSet], 0, 0).setDepth(-1);
    const collider = map.createStaticLayer('collider', [tileSet], 0, 0);
    const coins = map.createFromObjects('coins', 27, { key: "face" }); // used coins layer to represent face

    collider.setCollisionByProperty({ collide: true })

    const walls = this.physics.add.staticGroup();
    collider.forEachTile(tile => {
      const tileWorldPos = collider.tileToWorldXY(tile.x, tile.y),
        collisionGroup = tileSet.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return; }
      else {
        const objects = collisionGroup.objects;
        objects.forEach((object) => {
          object.rectangle ? walls.create(tileWorldPos.x + 16, tileWorldPos.y + 16, null).setSize(object.width, object.height).setOffset(object.x, object.y).setOrigin(0).setVisible(false) : null;
        })
      }
    })
    this.physics.add.collider(gameState.player, walls)

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
    const audioButton = this.add.sprite(scene_2_settings.canvasWidth - 20, scene_2_settings.canvasHeight - 20, 'audio_button_on').setScale(0.6).setScrollFactor(0).setDepth(10).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.6);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (gameState.healthVal > 0 && !deathBGM.isPaused) {
        sceneBGM.resume();
      } else {
        deathBGM.isPaused ? deathBGM.resume() : deathBGM.play();
      }
      audioPlaying = true
      audioButton.setTexture('audio_button_on').setScale(0.6);
    }, this);
    gameState.emitter.once('death_bgm', () => {
      sceneBGM.pause();
      audioPlaying ? deathBGM.play() : null
    }, this);

    // emitter for time
    gameState.emitter.once('end_time', () => {
      gameState.score = this.score;
      this.endTime = this.time.now;
      gameState.scene_1_time_raw = this.endTime - this.startTime;
      gameState.scene_1_time = gameFunctions.timeConvert(this.endTime - this.startTime);
    }, this)

    gameState.emitter.emit('play_bgm');

    this.backButton = this.add.sprite(scene_2_settings.canvasWidth / 2, scene_2_settings.canvasHeight / 2 + 50, 'back_button').setDepth(10).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => { this.scene.restart() }
      })
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
      this.score = gameState.bonusScore + parseInt(this.levelTime * gameState.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      gameState.player.noStop = null;

      gameState.emitter.emit('end_time');
      this.levelText.destroy();
      this.levelText = this.add.text(scene_1_settings.canvasWidth / 2, scene_1_settings.canvasHeight / 2 - 50, 'Game Over', { fontSize: 30, color: 'red' }).setScrollFactor(0).setOrigin(0.5);
      this.tweens.add({
        targets: this.levelText,
        alpha: 0,
        duration: 2000,
        loop: -1,
        ease: 'Linear',
        yoyo: false,
      });
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }

}