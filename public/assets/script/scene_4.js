'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 14, 2020
 */
class Scene_4 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_4' }) }

  init(data) {
    if (data) {
      this.playerScene = data.scene;
      this.playerScore = data.score;
      this.playerBonus = data.bonus;
      this.playerHealth = data.health;
      this.playerTime_raw = data.time_raw;
      this.forwardData = data;
    }

    this.scene_settings = {
      debug: false,
      introText: 'Level 4',

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 80,
      worldHeight: 32 * 80,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      playerSpawnPosition: [0, 1],
      familySpawnPosition: [42, 46],

      levelTime: 350, // s
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      backgroundDepth: -1,
      wallSpriteDepth: 1,
      playerSpriteDepth: 2,
      enemySpriteDepth: 2,
      itemSpriteDepth: 2,
      overlapSpriteDepth: 3,
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
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.spritesheet('f_dog', '/assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', '/assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', '/assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('s_catcher', '/assets/sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('back_button', '/assets/sprites/buttons/button_back.png');
    this.load.image('audio_button_on', '/assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', '/assets/sprites/buttons/sound_off.png');

    this.load.audio('scene_1_bgm', '/assets/bgm/Zain_bgm_01.mp3');
    this.load.audio('success_audio', '/assets/bgm/clips/Meme_success.mp3');
    this.load.audio('danger_audio', '/assets/bgm/Meme_action.mp3');
    this.load.audio('death_audio', '/assets/bgm/Zain_death.mp3');
    this.load.audio('bone_audio', '/assets/bgm/clips/Zain_bone.mp3');
    this.load.audio('death_event_audio', '/assets/bgm/clips/Zain_death_clip.mp3');

    this.load.image('father', '/assets/sprites/family/father.png');
    this.load.image('coin', '/assets/sprites/items/coin.png');
    this.load.image('bone', '/assets/sprites/items/bone.png');
    this.load.image('chair', '/assets/sprites/office/desk_chair.png');

    // tilemap and tileset
    this.load.image('background', '/assets/tileset/white_floor.png');
    this.load.image('tileset', '/assets/tileset/Office_Tileset.png');
    this.load.image('things', '/assets/tileset/things.png');
    this.load.tilemapTiledJSON('tilemap', '/assets/tilemaps/level_5.json');
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

    // healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(this.scene_settings.healthBarDepth);
    this.scene_settings.debug ? this.healthVal = 1000 : this.healthVal = this.playerHealth;
    [this.bonusScore, this.coinCount] = [0, 0];

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
    this.father = this.physics.add.sprite(
      this.scene_settings.familySpawnPosition[0] * 32,
      this.scene_settings.familySpawnPosition[1] * 32,
      'father'
    ).setOrigin(0).setDepth(this.scene_settings.playerSpriteDepth);
    this.physics.add.overlap(gameState.player, this.father, () => {
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
        time_raw: this.scene_time_raw
      }
      this.scene.stop();
      this.scene.get("Level_transition").scene.restart(forwardData);
    });

    // ------ map ------ //
    const map = this.add.tilemap('tilemap'),
      background = map.addTilesetImage('background'),
      tileset = map.addTilesetImage('tileset'),
      things = map.addTilesetImage('things');

    // background_1
    map.createStaticLayer('background_1', [tileset], 0, 0).setDepth(this.scene_settings.backgroundDepth);
    // background_2
    map.createStaticLayer('background_2', [background], 0, 0).setDepth(this.scene_settings.backgroundDepth);

    // static physics group
    const staticBodyPhysicsGroup = this.physics.add.staticGroup();

    // wall
    const wall = map.createStaticLayer('wall', [tileset], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, wall, staticBodyPhysicsGroup, false);
    // counter
    const counter = map.createStaticLayer('counter', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, counter, staticBodyPhysicsGroup, false);
    // printer
    const printer = map.createStaticLayer('printer', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, printer, staticBodyPhysicsGroup, false);
    // shelve
    const shelve = map.createStaticLayer('shelve', [tileset], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, shelve, staticBodyPhysicsGroup, false);
    // desk
    const desk = map.createStaticLayer('desk', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, desk, staticBodyPhysicsGroup, false);
    // water
    const water = map.createStaticLayer('water', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, water, staticBodyPhysicsGroup, false);

    // static physics group collider
    this.physics.add.collider(gameState.player, staticBodyPhysicsGroup);

    let [chairCollider] = [true];

    // chair (movable)
    const chair = map.createStaticLayer('chair', [tileset], 0, 0).setVisible(false);
    const chairPhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(tileset, chair, chairPhysicsGroup, true);
    chairPhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('chair').setInteractive().setCollideWorldBounds(true).setDamping(true).setDrag(0.2).setMaxVelocity(30).setMass(2).setDepth(this.scene_settings.itemSpriteDepth);
    });
    this.physics.add.collider(chairPhysicsGroup, [chairPhysicsGroup, staticBodyPhysicsGroup]);
    this.physics.add.collider(chairPhysicsGroup, gameState.player, () => {
      if (chairCollider) {
        const str = 'bork bork';
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
          onComplete: () => { message.destroy(); chairCollider = true }
        });
        chairCollider = false;
      }
    });

    // things layer (consumables)
    const thingsLayer = map.createStaticLayer('things', [things], 0, 0).setVisible(false);
    const coinPhysicsGroup = this.physics.add.group();
    const bonePhysicsGroup = this.physics.add.group();

    thingsLayer.forEachTile(tile => {
      const tileWorldPos = thingsLayer.tileToWorldXY(tile.x, tile.y),
        collisionGroup = things.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return }
      else {
        collisionGroup.objects.forEach(object => {
          if (object.ellipse) { // identifies ellipse hit box
            if (tile.properties.coin) {
              coinPhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'coin').setCircle(object.width / 2, object.x, object.y).setDepth(this.scene_settings.itemSpriteDepth);
            } else if (tile.properties.bone) {
              bonePhysicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, 'bone').setCircle(object.width / 2, object.x, object.y).setDepth(this.scene_settings.itemSpriteDepth);
            }
          }
        })
      }
      tile.destroy();
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
        audioPlaying ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // enemy
    const enemies = map.createFromObjects('enemies', 29, { key: 's_catcher' });
    const enemyPhysicsGroup = this.physics.add.group();
    enemies.forEach(sprite => {
      sprite.setVisible(false);
      const enemy = enemyPhysicsGroup.create(sprite.x, sprite.y, 's_catcher').setCollideWorldBounds(true).setDepth(this.scene_settings.enemySpriteDepth);
      const data = sprite.data.getAll();
      if (data && data[0]) {
        const port = {
          [data[0].name]: data[0].value,
          x: sprite.x,
          y: sprite.y
        }
        enemy.setData(port);
      }
      sprite.destroy();
    })
    this.physics.add.collider(enemyPhysicsGroup, [enemyPhysicsGroup, staticBodyPhysicsGroup, chairPhysicsGroup]);

    enemyPhysicsGroup.getChildren().forEach(function (gameObj) {
      if (gameObj.getData("tweenX")) {
        this.tweens.add({
          targets: gameObj,
          x: gameObj.x + (gameObj.getData("tweenX") * 32) + 16,
          ease: 'Linear',
          duration: Math.abs(gameObj.getData("tweenX")) * this.scene_settings.enemyTweenDurationMultiplier,
          repeat: -1,
          yoyo: true,
          loopDelay: this.scene_settings.enemyTweenLoopDelay,
          onYoyo: () => { gameObj.flipX = true },
          onRepeat: () => { gameObj.flipX = false }
        });
      } else if (gameObj.getData("tweenY")) {
        this.tweens.add({
          targets: gameObj,
          y: gameObj.y + (gameObj.getData("tweenY") * 32) + 16,
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
    // ------map ------ //

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 200,
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
    let audioPlaying = true,
      danger_bgm_toggle = true;

    // audio button
    const audioButton = this.add.sprite(
      this.scene_settings.canvasWidth - 20,
      this.scene_settings.canvasHeight - 20,
      'audio_button_on').setScale(0.5).setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setInteractive().setAlpha(0.5);
    audioButton.on('pointerover', () => { audioButton.alpha = 1 });
    audioButton.on('pointerout', () => { audioButton.alpha = 0.5 });
    audioButton.on('pointerup', () => { audioPlaying ? gameState.emitter.emit('pause_bgm') : gameState.emitter.emit('resume_bgm') });

    gameState.emitter = new Phaser.Events.EventEmitter();
    gameState.emitter.once('play_bgm', () => { sceneBGM.play() }, this);
    gameState.emitter.on('pause_bgm', () => {
      this.sound.pauseAll();
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
      audioPlaying = true;
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

    this.backButton = this.add.sprite(
      this.scene_settings.canvasWidth / 2,
      this.scene_settings.canvasHeight / 2 + 50,
      'back_button').setDepth(this.scene_settings.buttonDepth).setVisible(false).setOrigin(0.5).setInteractive().setScrollFactor(0);
    this.backButton.on('pointerover', () => { this.backButton.alpha = 0.8 });
    this.backButton.on('pointerout', () => { this.backButton.alpha = 1 });
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
          if (Math.round(gameObj.x) === gameObj.getData("x") && Math.round(gameObj.y) === gameObj.getData("y")) {
            tween.play();
          } else {
            this.physics.moveTo(gameObj, gameObj.getData("x"), gameObj.getData("y"));
          }
        }
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
      gameState.emitter.emit('end_time');
      gameState.emitter.emit('death_bgm');
      this.backButton.setVisible(true);
    }
  }
}