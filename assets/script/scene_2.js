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
  worldWidth: 1536,  // 48 x 32
  worldHeight: 1440, // 46 x 32
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71,
  twoKeyMultiplier: 0.707,
  playerSpawnPosition: [3, 3],
  enemyMoveSpeed: 85,
  enemyChaseDistance: 100,
  boneHealthRegen: 30,
  familySpawnPosition: [],

  enemy: [],
  enemyTweenDurationMultiplier: 500,
  enemyTweenLoopDelay: 20000
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
    gameState.player = this.physics.add.sprite(scene_1_settings.playerSpawnPosition[0] * 32 - 16, scene_1_settings.playerSpawnPosition[1] * 32 - 16, 'f_dog').setSize(30, 30).setDepth(1);
    gameState.player.setCollideWorldBounds(true);

    // gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
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
      gameFunctions.control(gameState, scene_1_settings);
      gameFunctions.activeHealthTextures(gameState);
    } else {
      this.levelText.destroy();
      this.levelText = this.add.text(scene_1_settings.canvasWidth / 2 - 70, scene_1_settings.canvasHeight / 2 - 50, 'Game Over', { fontSize: 30, color: '#4B004F' }).setScrollFactor(0);
      this.physics.pause();
      this.anims.pauseAll();
      this.tweens.pauseAll();
      gameState.emitter.emit('death_bgm');
    }
  }
}