'use strict'
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 24, 2020
 * @TODO implement score calc
 */

const scene_2_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 3200,
  worldHeight: 3200,
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71, // calculated
  playerSpawnPosition: [3, 3],
  enemyMoveSpeed: 90,
  enemyChaseDistance: 80,
  twoKeyMultiplier: 0.6,
  enemy1_spawnLocation: [10, 0],
  enemy1_tweenDistance: 10,
  enemy2_spawnLocation: [12, 12],
  enemy2_tweenDistance: 10,
}

class Scene_2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_2' });
  }

  preload() {
    gameFunctions.loading.call(this);
    // console.log(gameState.health)
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(scene_1_settings.playerSpawnPosition[0] * 32 - 16, scene_1_settings.playerSpawnPosition[1] * 32 - 16, 'f_dog').setScale(1).setDepth(10);
    gameState.player.setCollideWorldBounds(true);

    // gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);

    console.log(gameState.healthBar)
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
    // controls
    if (gameState.cursors.up.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // up
      gameState.player.setVelocityY(-scene_1_settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('b_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.up.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isUp && gameState.cursors.left.isUp) { // down
      gameState.player.setVelocityY(scene_1_settings.moveSpeed);
      gameState.player.setVelocityX(0);
      gameState.player.anims.play('f_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.down.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.left.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // left
      gameState.player.setVelocityX(-scene_1_settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.left.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.right.isDown && gameState.cursors.up.isUp && gameState.cursors.down.isUp) { // right
      gameState.player.setVelocityX(scene_1_settings.moveSpeed);
      gameState.player.setVelocityY(0);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (gameState.cursors.right.getDuration() * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.right.isDown) { // up right
      gameState.player.setVelocityY(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.up.getDuration() + gameState.cursors.right.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.up.isDown && gameState.cursors.left.isDown) { // up left
      gameState.player.setVelocityY(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.up.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.right.isDown) { //down right
      gameState.player.setVelocityY(scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = true;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.right.getDuration() + gameState.cursors.down.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else if (gameState.cursors.down.isDown && gameState.cursors.left.isDown) { //down left
      gameState.player.setVelocityY(scene_1_settings.diagonalMoveSpeed);
      gameState.player.setVelocityX(-scene_1_settings.diagonalMoveSpeed);
      gameState.player.flipX = false;
      gameState.player.anims.play('l_move', true);

      if (gameState.healthVal > 0) {
        gameState.healthVal -= (scene_1_settings.twoKeyMultiplier * (gameState.cursors.left.getDuration() + gameState.cursors.down.getDuration()) * scene_1_settings.movementHealthCostRatio)
      } else {
        gameState.healthVal = -1
      }
    } else {
      gameState.player.setVelocityX(0);
      gameState.player.setVelocityY(0);
      gameState.player.anims.pause()
      gameState.player.angle = 0;
    }
  }
}