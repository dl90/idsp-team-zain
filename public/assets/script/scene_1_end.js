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

    this.add.text(config.width / 2, config.height / 2 - 100, `Health left ${gameState.healthVal.toFixed(2)}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 80, `Score: ${gameState.score}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 60, `Time: ${gameState.scene_1_time}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    const playButton = this.add.sprite(config.width / 2, config.height - 100, 'play_button');
    const backButton = this.add.sprite(config.width / 2, config.height - 80, 'back_button');

    const status = this.add.text(config.width / 2, config.height / 2, '', { fontSize: 16, color: 'black' }).setOrigin(0.5);
    console.log(gameState.uid)
    fetch('/data/score', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ 'uid': gameState.uid, 'scene_1_score': gameState.score, 'scene_1_time_raw': gameState.scene_1_time_raw, 'scene_1_health': gameState.healthVal })
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        status.setText("Data not posted");
      }
    }).then(resData => {
      let newStatusText = ''
      const { scene_1_time_raw , scene_1_health, scene_1_score } = resData;
      scene_1_time_raw !== undefined ? newStatusText += "New best time!\n" : null
      scene_1_health !== undefined ? newStatusText += "New best health!\n" : null
      scene_1_score !== undefined ? newStatusText += "New best score!\n" : null
      status.setText(newStatusText);
    }).catch(err => console.log(err));

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