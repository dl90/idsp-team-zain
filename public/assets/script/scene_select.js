'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 11, 2020
 * @TODO Implement
 */
class Scene_select extends Phaser.Scene {
  constructor() { super({ key: 'Scene_select' }) }

  // keeping data from previous scene
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
      canvasWidth: 480,
      canvasHeight: 5000,

      buttonDepth: 3
    }
  }

  preload() {
    this.load.image('back_button', '/assets/sprites/buttons/button_back.png');
    this.load.image('play_button', '/assets/sprites/buttons/button_play.png');

    this.load.image('level_3', '/assets/sprites/overview/level_3.png');
    this.load.image('level_4', '/assets/sprites/overview/level_4.png');
    this.load.image('level_5', '/assets/sprites/overview/level_5.png');
  }

  create() {
    this.camera = this.cameras.main.setBounds(0, 0, this.scene_settings.worldWidth, this.scene_settings.worldHeight);

    const backButton = this.add.sprite(config.width / 2 - 50, 20, 'back_button');
    backButton.setInteractive().setScrollFactor(0).setDepth(this.scene_settings.buttonDepth);

    const playButton = this.add.sprite(config.width / 2 + 50, 20, 'play_button');
    playButton.setInteractive().setScrollFactor(0).setDepth(this.scene_settings.buttonDepth);

    this.add.image(100, 100, 'level_3').setScale(0.4).setOrigin(0);
    this.add.image(100, 360, 'level_4').setScale(0.4).setOrigin(0);
    this.add.image(100, 660, 'level_5').setScale(0.4).setOrigin(0);

    console.log(config.sceneKeys);

    this.add.rectangle(
      this.camera.centerX, 20,
      this.camera.displayWidth + 10, 40
    ).setFillStyle(0x000000, 0.85).setOrigin(0.5).setScrollFactor(0).setDepth(1);

    this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) { this.camera.scrollY += deltaY / 2 }, this);
  }

  update() {

  }
}