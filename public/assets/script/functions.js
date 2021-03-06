'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 23, 2020
 * @note common functions shared by many scenes
 */
const gameFunctions = {
  // loading screen
  "loading": function loading() {
    this.loadingText = this.make.text({
      x: config.width / 2 - 50, y: config.height / 2,
      text: 'Loading:',
      style: { fontSize: '24px', align: 'center', fill: '#000000' }
    }).setOrigin(0.5);

    this.percentText = this.make.text({
      x: config.width / 2 + 50, y: config.height / 2,
      text: '0%',
      style: { fontSize: '24px', align: 'center', fill: '#000000' }
    }).setOrigin(0.5);

    this.assetText = this.make.text({
      x: config.width / 2, y: config.height / 2 + 50,
      text: '',
      style: { fontSize: '14px', align: 'center', fill: '#000000' }
    }).setOrigin(0.5);

    this.load.on('progress', value => { this.percentText.setText(parseInt(value * 100) + '%') });
    this.load.on('fileprogress', file => { this.assetText.setText('Loading: ' + file.key) });
    this.load.on('complete', () => { this.loadingText.destroy(); this.percentText.destroy(); this.assetText.destroy() });
  },

  /**
   * Loads health textures with associated key and asset:
   * - 'health_100' : '/assets/sprites/health-bar/health_100.png'
   * - ...
   */
  "loadHealthTextures": function loadHealthTextures() {
    const healthPath = '/assets/sprites/health-bar'
    this.load.image('health_100', healthPath + '/health_100.png');
    this.load.image('health_90', healthPath + '/health_90.png');
    this.load.image('health_85', healthPath + '/health_85.png');
    this.load.image('health_80', healthPath + '/health_80.png');
    this.load.image('health_70', healthPath + '/health_70.png');
    this.load.image('health_65', healthPath + '/health_65.png');
    this.load.image('health_55', healthPath + '/health_55.png');
    this.load.image('health_50', healthPath + '/health_50.png');
    this.load.image('health_45', healthPath + '/health_45.png');
    this.load.image('health_40', healthPath + '/health_40.png');
    this.load.image('health_30', healthPath + '/health_30.png');
    this.load.image('health_20', healthPath + '/health_20.png');
    this.load.image('health_15', healthPath + '/health_15.png');
    this.load.image('health_10', healthPath + '/health_10.png');
  },

  /**
   * Loads common game buttons:
   * - 'back_button' : '/assets/sprites/buttons/button_back.png'
   * - 'audio_button_on' : '/assets/sprites/buttons/sound_on.png'
   * - 'audio_button_off' : '/assets/sprites/buttons/sound_off.png'
   */
  "loadCommonButtons": function loadCommonButtons() {
    this.load.image('back_button', '/assets/sprites/buttons/button_back.png');
    this.load.image('audio_button_on', '/assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', '/assets/sprites/buttons/sound_off.png');
  },

  /**
   * Loads player spritesheet:
   * - 'f_dog' : '/assets/sprites/dog/re_f_sheet.png'
   * - 'b_dog' : '/assets/sprites/dog/re_b_sheet.png'
   * - 'l_dog' : '/assets/sprites/dog/re_l_sheet.png'
   */
  "loadPlayerSpritesheet": function loadPlayerSpritesheet() {
    this.load.spritesheet('f_dog', '/assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', '/assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', '/assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });
  },

  /**
   * Loads level audio files:
   * - 'scene_1_bgm' : '/assets/bgm/Zain_bgm_01.mp3'
   * - 'success_audio' : '/assets/bgm/clips/Meme_success.mp3'
   * - 'danger_audio' : '/assets/bgm/Meme_action.mp3'
   * - 'death_audio' : '/assets/bgm/Zain_death.mp3'
   * - 'bone_audio' : '/assets/bgm/clips/Zain_bone.mp3'
   * - 'death_event_audio' : '/assets/bgm/clips/Zain_death_clip.mp3'
   */
  "loadCommonAudio": function loadCommonAudio() {
    this.load.audio('scene_1_bgm', '/assets/bgm/Zain_bgm_01.mp3');
    this.load.audio('success_audio', '/assets/bgm/clips/Meme_success.mp3');
    this.load.audio('danger_audio', '/assets/bgm/Meme_action.mp3');
    this.load.audio('death_audio', '/assets/bgm/Zain_death.mp3');
    this.load.audio('bone_audio', '/assets/bgm/clips/Zain_bone.mp3');
    this.load.audio('death_event_audio', '/assets/bgm/clips/Zain_death_clip.mp3');
  },

  /**
   * Creates player movement animations:
   * - 'f_move'
   * - 'b_move'
   * - 'l_move'
   */
  "animatePlayerSpritesheet": function animatePlayerSpritesheet() {
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
  },

  /**
   * Updates health bar textures
   * @param {Object} gameState must contain the following
   * - gameState.healthBar
   * - loaded textures with corresponding values
   * @param {Number} health player health value (this.healthVal)
   */
  "activeHealthTextures": (gameState, health) => {
    const healthTickers = {
      100: () => { gameState.healthBar.setTexture('health_100') },
      93: () => { gameState.healthBar.setTexture('health_90') },
      86: () => { gameState.healthBar.setTexture('health_85') },
      79: () => { gameState.healthBar.setTexture('health_80') },
      72: () => { gameState.healthBar.setTexture('health_70') },
      65: () => { gameState.healthBar.setTexture('health_65') },
      58: () => { gameState.healthBar.setTexture('health_55') },
      51: () => { gameState.healthBar.setTexture('health_50') },
      44: () => { gameState.healthBar.setTexture('health_45') },
      38: () => { gameState.healthBar.setTexture('health_40') },
      31: () => { gameState.healthBar.setTexture('health_30') },
      24: () => { gameState.healthBar.setTexture('health_20') },
      17: () => { gameState.healthBar.setTexture('health_15') },
      10: () => { gameState.healthBar.setTexture('health_10') }
    };
    for (const bar in healthTickers) {
      if ((health - bar >= -3.5) && (health - bar <= 3.5)) {
        healthTickers[bar]();
      }
    }
  },

  /**
   * Enables controls
   * @param {Object} gameState must contain the following
   *  - gameState.player
   *  - gameState.cursors
   * @param {Object} sceneSettings must contain the following
   *  - sceneSettings.moveSpeed
   *  - sceneSettings.diagonalMoveSpeed
   *  - sceneSettings.movementHealthCostRatio
   *  - sceneSettings.twoKeyMultiplier
   * @param {Number} health player health value (this.healthVal)
   */
  "control": (gameState, sceneSettings, health) => {
    gameState && sceneSettings ? new Error('Missing things') : null;

    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-sceneSettings.moveSpeed).setVelocityX(0);
      gameState.player.anims.play('b_move', true);
      (health > 0) ? health -= (gameState.cursors.up.getDuration() * sceneSettings.movementHealthCostRatio) : health = -1;

    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(sceneSettings.moveSpeed).setVelocityX(0);
      gameState.player.anims.play('f_move', true);
      (health > 0) ? health -= (gameState.cursors.down.getDuration() * sceneSettings.movementHealthCostRatio) : health = -1;

    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-sceneSettings.moveSpeed).setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      (health > 0) ? health -= (gameState.cursors.left.getDuration() * sceneSettings.movementHealthCostRatio) : health = -1;

    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(sceneSettings.moveSpeed).setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      (health > 0) ? health -= (gameState.cursors.right.getDuration() * sceneSettings.movementHealthCostRatio) : health = -1;

    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityX(sceneSettings.diagonalMoveSpeed).setVelocityY(-sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      if (health > 0) {
        health -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * sceneSettings.movementHealthCostRatio);
      } else {
        health = -1;
      }

    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityX(-sceneSettings.diagonalMoveSpeed).setVelocityY(-sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      if (health > 0) {
        health -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * sceneSettings.movementHealthCostRatio);
      } else {
        health = -1;
      }

    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityX(sceneSettings.diagonalMoveSpeed).setVelocityY(sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      if (health > 0) {
        health -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * sceneSettings.movementHealthCostRatio)
      } else {
        health = -1
      }

    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityX(-sceneSettings.diagonalMoveSpeed).setVelocityY(sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      if (health > 0) {
        health -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * sceneSettings.movementHealthCostRatio)
      } else {
        health = -1
      }

    } else {
      if (!gameState.player.noStop) {
        gameState.player.setVelocityX(0).setVelocityY(0);
        gameState.player.anims.pause();
      }
    }
    return health;
  },

  /** 
   * Calculates distance between two game objects
   * @param {Object} gameObj1 Phaser game object
   * @param {Object} gameObj2 Phaser game object
   * @return {Number} Distance between
   */
  "distanceCalc": (gameObj1, gameObj2) => { return Phaser.Math.Distance.Between(gameObj1.x, gameObj1.y, gameObj2.x, gameObj2.y) },

  /**
   * Converts ms to make it easier to read
   * @param {Number} ms Milliseconds to convert
   * @return {String} formatted time
   */
  "timeConvert": (ms) => {
    let milliseconds = parseInt((ms % 1000)),
      seconds = parseInt((ms / 1000) % 60),
      minutes = parseInt((ms / (1000 * 60)) % 60),
      hours = parseInt((ms / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  },

  /**
   * Flips animation of enemy game object based on X velocity
   * @param {Object} enemy Phaser game object containing animations
   * @param {String} animationKey Key for accessing the animation
   */
  "biDirectional_enemy": (enemy, animationKey) => {
    if (enemy.body.velocity.x > 0) {
      enemy.flipX = false;
      enemy.anims.play(animationKey, true);
    } else if (enemy.body.velocity.x < 0) {
      enemy.flipX = true;
      enemy.anims.play(animationKey, true);
    } else {
      enemy.anims.pause();
    }
  },

  /**
   * Generates custom hit-box (RECTANGLE ONLY) from Tiled by creating a physics body for each tile
   * @param {Object} tileSet Phaser tileset reference:
   * - const map = this.add.tilemap('tilemap_key');
   * - const tileSet = map.addTilesetImage('tileset_key');
   * @param {Object} layer Phaser tilemap layer:
   * - const layer = map.createStaticLayer('layer_key', [tileSet], 0, 0);
   * @param {Object} physicsGroup Phaser physics group:
   * - const physicsGroup = this.physics.add.staticGroup();
   * @param {Boolean} visible Set physics group to be visible (true) or invisible (false)
   */
  "hitBoxGenerator": (tileSet, layer, physicsGroup, visible = false) => {
    !tileSet && layer && physicsGroup ? (() => { return new Error("Missing key objects") })() : null;
    layer.forEachTile(tile => {
      const tileWorldPos = layer.tileToWorldXY(tile.x, tile.y),
        collisionGroup = tileSet.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return }
      else {
        collisionGroup.objects.forEach((object) => {
          if (object.rectangle) {
            physicsGroup.create(tileWorldPos.x + 16, tileWorldPos.y + 16, null).setSize(object.width, object.height).setOffset(object.x, object.y).setVisible(visible);
          } else {
            return;
          }
        });
      }

      visible ? tile.destroy() : null;
    });
  }
}
