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

  // loads health textures
  "loadHealthTextures": function loadHealthTextures() {
    const healthPath = './assets/sprites/health-bar'
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
