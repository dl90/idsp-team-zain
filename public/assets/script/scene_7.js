'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 13, 2020
 * @note store theme
 */
class Scene_7 extends Phaser.Scene {
  constructor() { super({ key: 'Scene_7' }) }

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
      introText: 'Level 7',

      canvasWidth: 480,
      canvasHeight: 270,
      worldWidth: 32 * 105,
      worldHeight: 32 * 48,

      playerSpawnPosition: [4, 0],
      familySpawnPosition: [100, 47],

      levelTime: 400,
      boneHealthRegen: 30,
      coinScoreBonus: 1000,

      moveSpeed: 100,
      movementHealthCostRatio: 0.000005,
      diagonalMoveSpeed: 70.71,
      twoKeyMultiplier: 0.707,

      enemyMoveSpeed: 85,
      enemyChaseDistance: 100,
      enemyHealthReduction: 0.1,
      enemyTweenDurationMultiplier: 500,
      enemyTweenLoopDelay: 20000,

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
    }
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);
    gameFunctions.loadPlayerSpritesheet.apply(this);
    gameFunctions.loadCommonButtons.apply(this);
    gameFunctions.loadCommonAudio.apply(this);

    this.load.spritesheet('s_catcher', '/assets/sprites/catcher/s_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('mother', '/assets/sprites/family/mother.png');
    this.load.image('coin', '/assets/sprites/items/coin.png');
    this.load.image('bone', '/assets/sprites/items/bone.png');
    this.load.image('cart', '/assets/sprites/grocery/cart.png')
    this.load.image('pepsi', '/assets/sprites/grocery/pepsi.png')

    // tilemap and tileset
    this.load.image('level_7_floor', '/assets/tileset/grocery_floor.png');
    this.load.image('level_7_tileset', '/assets/tileset/Group 6.png');
    this.load.image('things', '/assets/tileset/things.png');
    this.load.tilemapTiledJSON('level_7_tilemap', '/assets/tilemaps/level_7.json');
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
    gameState.player.setCollideWorldBounds(true);

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
    this.mother = this.physics.add.sprite(
      this.scene_settings.familySpawnPosition[0] * 32,
      this.scene_settings.familySpawnPosition[1] * 32,
      'mother'
    ).setOrigin(0).setDepth(this.scene_settings.playerSpriteDepth);
    this.physics.add.overlap(gameState.player, this.mother, () => {
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
    const map = this.add.tilemap('level_7_tilemap'),
      tileset = map.addTilesetImage('tileset', 'level_7_tileset'),
      floor = map.addTilesetImage('floor', 'level_7_floor'),
      things = map.addTilesetImage('things');

    // background
    map.createStaticLayer('background', [floor], 0, 0).setDepth(this.scene_settings.backgroundDepth);

    // static physics group
    const staticBodyPhysicsGroup = this.physics.add.staticGroup();

    // wall
    const wall = map.createStaticLayer('wall', [tileset], 0, 0).setDepth(this.scene_settings.wallSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, wall, staticBodyPhysicsGroup, false);
    // fridge
    const fridge = map.createStaticLayer('fridge', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, fridge, staticBodyPhysicsGroup, false);
    // fruit
    const fruit = map.createStaticLayer('fruit', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, fruit, staticBodyPhysicsGroup, false);
    // apple
    const apple = map.createStaticLayer('apple', [tileset], 0, 0).setDepth(this.scene_settings.overlapSpriteDepth);
    gameFunctions.hitBoxGenerator(tileset, apple, staticBodyPhysicsGroup, false);

    // static physics group collider
    this.physics.add.collider(gameState.player, staticBodyPhysicsGroup);

    let [cartCollider, pepsiCollider] = [true, true];

    // cart (movable)
    const cart = map.createStaticLayer('cart', [tileset], 0, 0).setVisible(false);
    const cartPhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(tileset, cart, cartPhysicsGroup, true);
    cartPhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('cart').setInteractive().setCollideWorldBounds(true)
        .setDamping(true).setDrag(0.2).setMaxVelocity(30).setMass(2).setSize(30, 20).setDepth(this.scene_settings.itemSpriteDepth);
    });
    this.physics.add.collider(cartPhysicsGroup, [cartPhysicsGroup, staticBodyPhysicsGroup]);
    this.physics.add.collider(cartPhysicsGroup, gameState.player, () => {
      if (cartCollider && pepsiCollider) {
        const message = this.add.text(
          this.scene_settings.canvasWidth / 2,
          this.scene_settings.canvasHeight - 30,
          'Zoom Zoom',
          { fontSize: 16, color: '#FF7A00' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(this.scene_settings.messageDepth);
        this.tweens.add({
          targets: message,
          alpha: 0,
          duration: 1000,
          loop: 2,
          ease: 'Linear',
          yoyo: false,
          onComplete: () => { message.destroy(); cartCollider = true }
        });
        cartCollider = false;
      }
    });

    // pepsi (movable)
    const pepsi = map.createStaticLayer('pepsi', [tileset], 0, 0).setVisible(false);
    const pepsiPhysicsGroup = this.physics.add.group();
    gameFunctions.hitBoxGenerator(tileset, pepsi, pepsiPhysicsGroup, true);
    pepsiPhysicsGroup.getChildren().forEach(obj => {
      obj.setTexture('pepsi').setInteractive().setCollideWorldBounds(true)
        .setDamping(true).setDrag(0.8).setMaxVelocity(10).setMass(4).setSize(15, 26).setDepth(this.scene_settings.overlapSpriteDepth);
    });
    this.physics.add.collider(pepsiPhysicsGroup, [pepsiPhysicsGroup, staticBodyPhysicsGroup, cartPhysicsGroup]);
    this.physics.add.collider(pepsiPhysicsGroup, gameState.player, () => {
      if (pepsiCollider && cartCollider) {
        const str = 'This is not an endorsement';
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
          onComplete: () => { message.destroy(); pepsiCollider = true }
        });
        pepsiCollider = false;
      }
    });

    // things layer (consumables)
    const thingsLayer = map.createStaticLayer('things', [things], 0, 0).setVisible(false),
      coinPhysicsGroup = this.physics.add.group(),
      bonePhysicsGroup = this.physics.add.group();

    thingsLayer.forEachTile(tile => {
      const tileWorldPos = thingsLayer.tileToWorldXY(tile.x, tile.y),
        collisionGroup = things.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return }
      else {
        collisionGroup.objects.forEach(object => {
          if (object.ellipse) {
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
        this.coinCount += 1;
        gameObj.destroy();
      });
    });

    bonePhysicsGroup.getChildren().forEach(gameObj => {
      this.physics.add.overlap(gameState.player, gameObj, () => {
        (this.healthVal + this.scene_settings.boneHealthRegen) > 100 ? this.healthVal = 100 : this.healthVal += this.scene_settings.boneHealthRegen;

        this.audioToggle ? boneClip.play() : null;
        gameObj.destroy();
        gameFunctions.activeHealthTextures(gameState);
      });
    });

    // enemy
    const enemies = map.createFromObjects('enemies', 17, { key: 's_catcher' });
    const enemyPhysicsGroup = this.physics.add.group();
    enemies.forEach(sprite => {
      sprite.setVisible(false);
      const enemy = enemyPhysicsGroup.create(sprite.x, sprite.y, 's_catcher').setCollideWorldBounds(true).setDepth(this.scene_settings.enemySpriteDepth);
      const data = sprite.data.getAll();
      let face = false;
      if (data && data[0] && data[1]) {
        data[0].value < 0 || data[1].value < 0 ? face = true : null;
        const port = {
          [data[0].name]: data[0].value,
          [data[1].name]: data[1].value,
          x: sprite.x,
          y: sprite.y
        }
        enemy.setData(port);
        enemy.flipX = face;
      }
    })
    this.physics.add.collider(enemyPhysicsGroup, [enemyPhysicsGroup, staticBodyPhysicsGroup, cartPhysicsGroup, pepsiPhysicsGroup]);

    enemyPhysicsGroup.getChildren().forEach(function (gameObj) {
      if (gameObj.getData("tweenX") !== 0) {
        this.tweens.add({
          targets: gameObj,
          x: gameObj.x + (gameObj.getData("tweenX") * 32) + 16,
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
          y: gameObj.y + (gameObj.getData("tweenY") * 32) + 16,
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

    // events by location:
    // layer.setTileLocationCallback(x, y, tile - size - x, tile - size - y, () => {
    //   - multiple times
    //   one time = layer.setTileLocationCallback(x, y, tile - size - x, tile - size - y, null)
    // });
    // events by index:
    // layer.setTileIndexCallback([...], () => { });
    // ------map ------ //

    // audio department
    const sound_config = {
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 100,
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
      this.sound.pauseAll();
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
      this.audioToggle = true;
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
          if (Math.round(gameObj.x) === gameObj.getData("x") && Math.round(gameObj.y) === gameObj.getData("y")) {
            tween.play();
          } else {
            this.physics.moveTo(gameObj, gameObj.getData("x"), gameObj.getData("y"));
          }
        }
      }
    });

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