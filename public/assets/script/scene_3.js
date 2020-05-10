'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 9, 2020
 */

const scene_3_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 32 * 79,
  worldHeight: 32 * 63,

  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71,
  twoKeyMultiplier: 0.707,

  playerSpawnPosition: [0, 4],
  familySpawnPosition: [47, 0],
  levelTime: 300,

  backgroundDepth: -1,
  wallSpriteDepth: 1,
  playerSpriteDepth: 2,
  itemSpriteDepth: 2,
  treeSpriteDepth: 3,
  scoreTimerBackgroundDepth: 4,
  scoreTextDepth: 5,
  healthBarDepth: 5,
  deathBackgroundMaskDepth: 6,
  deathBackgroundUnmaskDepth: 7,
  messageDepth: 10,
  buttonDepth: 10
}

class Scene_3 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_3' }) }

  init(data) {
    if (data) {
      this.playerScene = data.scene;
      this.playerScore = data.score;
      this.playerBonus = data.bonus;
      this.playerHealth = data.health;
      this.playerTime_raw = data.time_raw;
      this.forwardData = data;
    } else {
      throw new Error('Missing data')
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.spritesheet('f_dog', './assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('audio_button_on', './assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './assets/sprites/buttons/sound_off.png');

    this.load.audio('scene_1_bgm', './assets/bgm/Zain_bgm_01.mp3');
    this.load.audio('success_audio', './assets/bgm/clips/Meme_success.mp3');
    this.load.audio('death_audio', './assets/bgm/Meme_death.mp3');

    this.load.image('girl', './assets/sprites/family/girl.png');
    this.load.image('recycle_bin', './assets/sprites/level_1/recycle_bin.png');
    this.load.image('coin', './assets/sprites/items/coin.png');
    this.load.image('bone', './assets/sprites/items/bone.png');

    // tilemap and tileset
    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.tilemapTiledJSON('scene_3', './assets/tilemaps/level_3.json');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, scene_3_settings.worldWidth, scene_3_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_3_settings.worldWidth, scene_3_settings.worldHeight);

    // level title
    this.levelText = this.add.text(
      scene_1_settings.canvasWidth / 2,
      scene_1_settings.canvasHeight / 2,
      'Level 3',
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_3_settings.messageDepth);

    // control (cursors need to be recreated per scene)
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      scene_3_settings.playerSpawnPosition[0] * 32,
      scene_3_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(scene_3_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true).setBounce(1);


    // healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(scene_3_settings.healthBarDepth);
    this.bonusScore = 0; // resetBonus
    this.coinCount = 0;
    this.healthVal = this.playerHealth;
    this.healthVal = 100; //@TODO remove

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    // time tracker
    this.levelTime = scene_3_settings.levelTime;
    this.add.rectangle(scene_1_settings.canvasWidth / 2 + 70, 10, 260, 15)
      .setFillStyle(0xffffff, 0.5).setScrollFactor(0).setDepth(scene_3_settings.scoreTimerBackgroundDepth);
    this.timeText = this.add.text(
      scene_3_settings.canvasWidth / 2, 10,
      `Level time: ${this.levelTime}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_3_settings.messageDepth);

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
      scene_3_settings.canvasWidth / 2 + 150, 10,
      `Score: ${this.score}`,
      { fontSize: 12, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(scene_3_settings.scoreTextDepth);

    // scene transition
    this.girl = this.physics.add.sprite(scene_3_settings.familySpawnPosition[0] * 32, scene_3_settings.familySpawnPosition[1] * 32, 'girl').setOrigin(0);
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
        health: this.healthVal,
        time_raw: this.scene_2_time_raw
      }
      this.scene.stop("Scene_2");
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

    // ------ map ------ //
    const map = this.add.tilemap('scene_3');
    const tileSet = map.addTilesetImage('level_1');

    // background
    map.createStaticLayer('background', [tileSet], 0, 0).setDepth(scene_3_settings.backgroundDepth);

    // wall layer // walls.setCollisionByProperty({ collide: true });
    const wall = map.createStaticLayer('wall', [tileSet], 0, 0).setDepth(scene_3_settings.wallSpriteDepth);
    const wallsPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, wall, wallsPhysicsGroup, false);
    this.physics.add.collider(gameState.player, wallsPhysicsGroup);

    // bush layer
    const bush = map.createStaticLayer('bush', [tileSet], 0, 0).setDepth(scene_3_settings.wallSpriteDepth);
    this.bushPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, bush, this.bushPhysicsGroup, false);

    // tree layer
    const tree = map.createStaticLayer('tree', [tileSet], 0, 0).setDepth(scene_3_settings.treeSpriteDepth);
    const treesPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, tree, treesPhysicsGroup, false);
    this.physics.add.collider(gameState.player, treesPhysicsGroup);

    // interactive layer
    const recycleBins = map.createStaticLayer('interactive', [tileSet], 0, 0).setVisible(false);
    const recyclePhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(tileSet, recycleBins, recyclePhysicsGroup, true);
    recyclePhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('recycle_bin').setInteractive().setCollideWorldBounds(true).setDamping(true).setDrag(0.2).setMaxVelocity(30).setMass(3).setSize(20, 24);
    });
    let recycleCollider = true
    this.physics.add.collider(recyclePhysicsGroup, [wallsPhysicsGroup, this.bushPhysicsGroup, treesPhysicsGroup, recyclePhysicsGroup]);
    this.physics.add.collider(recyclePhysicsGroup, gameState.player, () => {
      if (recycleCollider) {
        const str = 'Bark';
        const message = this.add.text(scene_1_settings.canvasWidth / 2 - 30, scene_1_settings.canvasHeight - 30, str, { fontSize: 16, color: '#FF7A00' }).setScrollFactor(0).setDepth(scene_3_settings.messageDepth);
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

    // consumables layer
    const consumables = map.createStaticLayer('consumables', [tileSet], 0, 0).setVisible(false);
    const coinPhysicsGroup = this.physics.add.group();
    const bonePhysicsGroup = this.physics.add.group();

    consumables.forEachTile(tile => {
      const tileWorldPos = consumables.tileToWorldXY(tile.x, tile.y),
        collisionGroup = tileSet.getTileCollisionGroup(tile.index);
      // collisionGroup ? console.log(collisionGroup.objects) : null

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return }
      else {
        collisionGroup.objects.forEach(object => {
          if (object.ellipse) { // using circle for now
            if (tile.properties.coin) {
              coinPhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'coin').setCircle(object.width / 2, object.x, object.y).setDepth(scene_3_settings.itemSpriteDepth);
            } else if (tile.properties.bone) {
              bonePhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'bone').setCircle(object.width / 2, object.x, object.y).setDepth(scene_3_settings.itemSpriteDepth);
            }
          }
        })
      }
    });

    coinPhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        this.bonusScore += scene_1_settings.coinScoreBonus;
        this.coinCount += 1; // @TODO
        gameObj.destroy();
      });
    });

    bonePhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (this.healthVal + scene_1_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += scene_1_settings.boneHealthRegen;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // catchers layer
    const catchers = map.createFromObjects('catchers', 27, { key: "face" });


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

    const sceneBGM = this.sound.add('scene_1_bgm', sound_config);
    const deathBGM = this.sound.add('death_audio', sound_config);
    this.sound.pauseOnBlur = false;
    let audioPlaying = true;

    // audio button
    const audioButton = this.add.sprite(
      scene_3_settings.canvasWidth - 20,
      scene_3_settings.canvasHeight - 20,
      'audio_button_on').setScale(0.5).setScrollFactor(0).setDepth(scene_3_settings.buttonDepth).setInteractive();
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll()
      audioPlaying = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    gameState.emitter.on('resume_bgm', () => {
      if (this.healthVal > 0 && !deathBGM.isPaused) {
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
        scene_3_settings.canvasWidth / 2,
        scene_3_settings.canvasHeight / 2 - 50,
        'Game Over',
        { fontSize: 30, color: 'white' }).setScrollFactor(0).setOrigin(0.5).setDepth(scene_3_settings.messageDepth);
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
        this.camera.displayHeight + 20).setFillStyle(0x000000, 0.2).setScrollFactor(0).setDepth(scene_3_settings.deathBackgroundMaskDepth);
      this.tweens.add({
        targets: mask,
        duration: 4000,
        fillAlpha: 0.9
      });

      const unmask = this.add.circle(
        this.camera.centerX + this.camera.displayWidth / 2 - 20,
        this.camera.centerY + this.camera.displayHeight / 2 - 20,
        10
      ).setFillStyle(0xffffff, 0).setScrollFactor(0).setDepth(scene_3_settings.deathBackgroundUnmaskDepth);
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
      scene_3_settings.canvasWidth / 2,
      scene_3_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(scene_3_settings.buttonDepth).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerup', () => {
      this.tweens.add({
        targets: deathBGM,
        volume: 0,
        duration: 1500,
        onComplete: () => { this.scene.restart(this.forwardData) } // restarts scene with previously passed data
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
    if (gameState.player) {
      this.physics.overlap(gameState.player, this.bushPhysicsGroup) ?
        gameState.player.setDamping(true).setDrag(0.6).setMaxVelocity(50) :
        gameState.player.setDamping(false).setDrag(1).setMaxVelocity(scene_1_settings.moveSpeed);
    }

    if (this.healthVal > 0) {
      this.healthVal = gameFunctions.control(gameState, scene_3_settings, this.healthVal);
      gameFunctions.activeHealthTextures(gameState, this.healthVal);

      // update score
      this.score = this.bonusScore + parseInt(this.levelTime * this.healthVal);
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      // gameState.player.noStop = null;
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }

}