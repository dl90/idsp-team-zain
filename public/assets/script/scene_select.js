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
  }

  preload() {

  }

  create() {

  }
}