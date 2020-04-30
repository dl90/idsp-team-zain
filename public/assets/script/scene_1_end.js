'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 22, 2020
 * @TODO implement score calc
 */

class Scene_1_end extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1_end' });
  }

  preload() {
    this.load.image('play_button', './assets/sprites/buttons/button_play.png');
    this.load.image('back_button', './assets/sprites/buttons/button_back.png');
  }
  create() {
    this.scene.stop("Scene_1");

    this.add.text(config.width / 2, config.height / 2 - 50, `Health left ${gameState.healthVal.toFixed(2)}`, { fontSize: 16, color: '#7E00C2' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 20, `Score: ${gameState.score}`, { fontSize: 16, color: '#7E00C2' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 + 10, `Time: ${gameState.scene_1_time}`, { fontSize: 16, color: '#7E00C2' }).setOrigin(0.5);
    const playButton = this.add.sprite(config.width / 2, config.height - 100, 'play_button');
    const backButton = this.add.sprite(config.width / 2, config.height - 80, 'back_button');

    playButton.setInteractive();
    backButton.setInteractive();

    playButton.on('pointerup', () => {
      this.scene.stop('Scene_1_end');
      this.sound.stopAll();
      this.scene.start('Scene_2');
    })

    backButton.on('pointerup', () => {
      this.scene.stop('Scene_1_end');
      this.sound.stopAll();
      this.scene.get("Scene_1").scene.restart();
    })
  }

  // update() {}
}