'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 9, 2020
 * @note park theme
 */
class Scene_2 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_2' }) }

  init(data) {
    if (data) {
      this.forwardData = data;

      data.scene ? this.playerScene = data.scene : null;
      data.score ? this.playerScore = data.score : null;
      data.bonus ? this.playerBonus = data.bonus : null;
      data.health ? this.playerHealth = data.health : null;
      data.time_raw ? this.playerTime_raw = data.time_raw : null;
      data.audioToggle ? this.audioToggle = data.audioToggle : null;
    }

    this.scene_settings = {
      debug: false,
      introText: 'Level 2',

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 79,
      worldHeight: 32 * 63,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      playerSpawnPosition: [0, 4],
      familySpawnPosition: [79, 30],

      levelTime: 300, // s
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

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
      buttonDepth: 10,

      enemyMoveSpeed: 85,
      enemyChaseDistance: 100,
      enemyHealthReduction: 0.1, // per 16ms
      enemyTweenDurationMultiplier: 500,
      enemyTweenLoopDelay: 20000,

      enemy: [
        { "id": 1, "x": 17, "y": 11, "tweenX": 6, "tweenY": 0 },
        { "id": 2, "x": 6, "y": 19, "tweenX": 0, "tweenY": -6 },
        { "id": 3, "x": 15, "y": 24, "tweenX": 0, "tweenY": -6 },
        { "id": 4, "x": 35, "y": 13, "tweenX": 0, "tweenY": -6 },
        { "id": 5, "x": 40, "y": 25, "tweenX": 0, "tweenY": -7 },
        { "id": 6, "x": 55, "y": 21, "tweenX": 0, "tweenY": -7 },
        { "id": 7, "x": 74, "y": 13, "tweenX": -6, "tweenY": 0 },
        { "id": 8, "x": 20, "y": 45, "tweenX": 0, "tweenY": 7 },
        { "id": 9, "x": 12, "y": 61, "tweenX": 0, "tweenY": -6 },
        { "id": 10, "x": 39, "y": 45, "tweenX": -6, "tweenY": 0 },
        { "id": 11, "x": 48, "y": 59, "tweenX": 0, "tweenY": -6 },
        { "id": 12, "x": 74, "y": 50, "tweenX": -8, "tweenY": 0 },
        { "id": 13, "x": 50, "y": 43, "tweenX": 6, "tweenY": 0 },
      ]
    }
  }

  preload() {
    gameFunctions.loading.apply(this);
    gameFunctions.loadHealthTextures.apply(this);
    gameFunctions.loadPlayerSpritesheet.apply(this);

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
    this.load.image('recycle_bin', './assets/sprites/level_1/recycle_bin.png');
    this.load.image('coin', './assets/sprites/items/coin.png');
    this.load.image('bone', './assets/sprites/items/bone.png');

    // tilemap and tileset
    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.image('extruded', './assets/tileset/extruded.png');
    this.load.tilemapTiledJSON('tilemap', './assets/tilemaps/level_2.json');
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
      this.scene_settings.introText,
      { fontSize: 30, color: '#000000' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);

    // control (cursors need to be recreated per scene)
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(
      this.scene_settings.playerSpawnPosition[0] * 32,
      this.scene_settings.playerSpawnPosition[1] * 32,
      'f_dog').setSize(30, 30).setDepth(this.scene_settings.playerSpriteDepth).setOrigin(0);
    gameState.player.setCollideWorldBounds(true).setBounce(1);

    // initialize health
    [this.bonusScore, this.coinCount, this.healthVal] = [0, 0, this.playerHealth];

    // healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(this.scene_settings.healthBarDepth);
    this.scene_settings.debug ? this.healthVal = 100 : null;

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
    this.girl = this.physics.add.sprite(
      this.scene_settings.familySpawnPosition[0] * 32 - 32,
      this.scene_settings.familySpawnPosition[1] * 32,
      'girl'
    ).setOrigin(0).setDepth(this.scene_settings.playerSpriteDepth);
    this.physics.add.overlap(gameState.player, this.girl, () => {
      this.sound.pauseAll();

      // timer (end of scene)
      gameState.emitter.emit('end_time');
      this.audioToggle ? this.sound.play('success_audio') : null

      // @TODO
      this.cumulativeScore = this.playerScore + this.score;

      // forwarded data
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
    const map = this.add.tilemap('tilemap'),
      tileSet = map.addTilesetImage('level_1'),
      extruded = map.addTilesetImage('extruded');

    // extruded
    map.createStaticLayer('extruded', [extruded], 0, 0).setDepth(this.scene_settings.backgroundDepth);

    // wall layer // walls.setCollisionByProperty({ collide: true });
    const wall = map.createStaticLayer('wall', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    const wallsPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, wall, wallsPhysicsGroup, false);
    this.physics.add.collider(gameState.player, wallsPhysicsGroup);

    // bush layer
    const bush = map.createStaticLayer('bush', [tileSet], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    this.bushPhysicsGroup = this.physics.add.staticGroup();
    gameFunctions.hitBoxGenerator(tileSet, bush, this.bushPhysicsGroup, false);

    // tree layer
    const tree = map.createStaticLayer('tree', [tileSet], 0, 0).setDepth(this.scene_settings.treeSpriteDepth);
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
        const message = this.add.text(
          this.scene_settings.canvasWidth / 2,
          this.scene_settings.canvasHeight - 30,
          str,
          { fontSize: 16, color: '#FF7A00' }
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
              coinPhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'coin').setCircle(object.width / 2, object.x, object.y).setDepth(this.scene_settings.itemSpriteDepth);
            } else if (tile.properties.bone) {
              bonePhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'bone').setCircle(object.width / 2, object.x, object.y).setDepth(this.scene_settings.itemSpriteDepth);
            }
          }
        })
      }
    });

    coinPhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        this.bonusScore += this.scene_settings.coinScoreBonus;
        this.coinCount += 1; // @TODO
        gameObj.destroy();
      });
    });

    bonePhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (this.healthVal + this.scene_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += this.scene_settings.boneHealthRegen;

        // play bone audio
        this.audioToggle ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });
    // ------ map ------ //

    // enemy group
    const enemiesPhysicsGroup = this.physics.add.group();
    this.scene_settings.enemy.forEach(function (obj) {
      enemiesPhysicsGroup.create(obj.x * 32 + 16, obj.y * 32 + 16, 's_catcher').setCollideWorldBounds(true)
        .setData({
          "id": obj.id,
          "x": obj.x,
          "y": obj.y,
          "tweenX": obj.tweenX,
          "tweenY": obj.tweenY
        });
    }, this);
    this.physics.add.collider(enemiesPhysicsGroup, [enemiesPhysicsGroup, wallsPhysicsGroup, this.bushPhysicsGroup, treesPhysicsGroup, recyclePhysicsGroup]);

    enemiesPhysicsGroup.getChildren().forEach(function (gameObj) {
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: (gameObj.getData("x") * 32 + gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay,
          onYoyo: () => { gameObj.flipX = true },
          onRepeat: () => { gameObj.flipX = false }
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
          onYoyo: () => { gameObj.flipX = true },
          onRepeat: () => { gameObj.flipX = false }
        });
      }
    }, this);

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: -200,
      seek: 0,
      loop: true,
      delay: 0
    }

    const sceneBGM = this.sound.add('scene_1_bgm', sound_config);
    const deathBGM = this.sound.add('death_audio', sound_config);
    const dangerBGM = this.sound.add('danger_audio', sound_config);
    const boneClip = this.sound.add('bone_audio', sound_config.loop = false);
    const deathClip = this.sound.add('death_event_audio', sound_config.loop = false);

    this.sound.pauseOnBlur = false;
    let danger_bgm_toggle = true;

    // audio button
    const audioButton = this.add.sprite(
      this.scene_settings.canvasWidth - 20,
      this.scene_settings.canvasHeight - 20,
      this.audioToggle ? 'audio_button_on' : 'audio_button_off')
      .setScale(0.5).setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setInteractive().setAlpha(0.5);
    audioButton.on('pointerover', () => { audioButton.alpha = 1 });
    audioButton.on('pointerout', () => { audioButton.alpha = 0.5 });
    audioButton.on('pointerup', () => { this.audioToggle ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

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
        sceneBGM.resume();
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
    gameState.emitter.once('end_time', () => {
      this.endTime = this.time.now;
      this.scene_time_raw = this.endTime - this.startTime;
    }, this)

    this.audioToggle ? gameState.emitter.emit('play_bgm') : null;

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
    if (gameState.player) {
      this.physics.overlap(gameState.player, this.bushPhysicsGroup) ?
        gameState.player.setDamping(true).setDrag(0.6).setMaxVelocity(50) :
        gameState.player.setDamping(false).setDrag(1).setMaxVelocity(this.scene_settings.moveSpeed);
    }

    this.dangerState = false;
    const distanceCalc = gameFunctions.distanceCalc;

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
        } else if (distanceCalc(gameState.player, gameObj) < this.scene_settings.enemyChaseDistance) {
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
      // gameState.player.noStop = null;
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }

}