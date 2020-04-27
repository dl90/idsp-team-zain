'use strict'
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 23, 2020
 */

const gameFunctions = {
  // loading screen
  'loading': function loading() {
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
  'loadHealthTextures': function loadHealthTextures() {
    const healthPath = './sprites/health-bar'
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
   */
  activeHealthTextures: (gameState) => {
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
    }
    for (const bar in healthTickers) {
      if ((gameState.healthVal - bar >= -3.5) && (gameState.healthVal - bar <= 3.5)) {
        healthTickers[bar]()
      }
    }

  },

  /**
   * Enables controls
   * @param {Object} gameState must contain the following
   *  - gameState.player
   *  - gameState.cursors
   *  - gameState.healthVal
   * @param {Object} sceneSettings must contain the following
   *  - sceneSettings.movementHealthCostRatio
   *  - sceneSettings.diagonalMoveSpeed
   *  - sceneSettings.twoKeyMultiplier
   */
  'control': (gameState, sceneSettings) => {
    gameState && sceneSettings ? new Error('Missing things') : null;

    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-sceneSettings.moveSpeed).setVelocityX(0);
      gameState.player.anims.play('b_move', true);
      (gameState.healthVal > 0) ? gameState.healthVal -= (gameState.cursors.up.getDuration() * sceneSettings.movementHealthCostRatio) : gameState.healthVal = -1;

    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(sceneSettings.moveSpeed).setVelocityX(0);
      gameState.player.anims.play('f_move', true);
      (gameState.healthVal > 0) ? gameState.healthVal -= (gameState.cursors.down.getDuration() * sceneSettings.movementHealthCostRatio) : gameState.healthVal = -1;
      
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-sceneSettings.moveSpeed).setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      (gameState.healthVal > 0) ? gameState.healthVal -= (gameState.cursors.left.getDuration() * sceneSettings.movementHealthCostRatio) : gameState.healthVal = -1;
      
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(sceneSettings.moveSpeed).setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      (gameState.healthVal > 0) ? gameState.healthVal -= (gameState.cursors.right.getDuration() * sceneSettings.movementHealthCostRatio) : gameState.healthVal = -1;
      
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityX(sceneSettings.diagonalMoveSpeed).setVelocityY(-sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      if (gameState.healthVal > 0) {
        gameState.healthVal -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * sceneSettings.movementHealthCostRatio);
      } else {
        gameState.healthVal = -1;
      }

    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityX(-sceneSettings.diagonalMoveSpeed).setVelocityY(-sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      if (gameState.healthVal > 0) {
        gameState.healthVal -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * sceneSettings.movementHealthCostRatio);
      } else {
        gameState.healthVal = -1;
      }

    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityX(sceneSettings.diagonalMoveSpeed).setVelocityY(sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);
      if (gameState.healthVal > 0) {
        gameState.healthVal -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * sceneSettings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }

    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityX(-sceneSettings.diagonalMoveSpeed).setVelocityY(sceneSettings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);
      if (gameState.healthVal > 0) {
        gameState.healthVal -= (sceneSettings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * sceneSettings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }

    } else {
      gameState.player.setVelocityX(0).setVelocityY(0);
      gameState.player.anims.pause()
      // gameState.player.angle = 0;
    }
  },

  /** 
   * Calculates distance between two game objects
   * @param {Object} gameObj1 Phaser game object
   * @param {Object} gameObj2 Phaser game object
   */
  'distanceCalc': (gameObj1, gameObj2) => { return Phaser.Math.Distance.Chebyshev(gameObj1.x, gameObj1.y, gameObj2.x, gameObj2.y) },


}
