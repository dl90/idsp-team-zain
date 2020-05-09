'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 7, 2020
 */

class Level_transition extends Phaser.Scene {
  constructor() { super({ key: 'Level_transition' }) }

  // keeping data from previous scene
  init(data) {
    this.playerScene = data.scene;
    this.playerScore = data.score;
    this.playerBonus = data.bonus;
    this.playerHealth = data.health;
    this.playerTime_raw = data.time_raw;
    this.forwardData = data;
  }

  preload() {
    this.load.image('play_button', './assets/sprites/buttons/button_play.png');
    this.load.image('back_button', './assets/sprites/buttons/button_back.png');
  }

  create() {
    this.add.text(config.width / 2, config.height / 2 - 100, `Score: \t${this.playerScore}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 80, `Health left: \t${this.playerHealth.toFixed(2)}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 60, `Time: \t${gameFunctions.timeConvert(this.playerTime_raw)}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    const playButton = this.add.sprite(config.width / 2, config.height - 80, 'play_button');
    const backButton = this.add.sprite(config.width / 2, config.height - 60, 'back_button');

    const status = this.add.text(config.width / 2, config.height / 2, '', { fontSize: 14, color: 'black' }).setOrigin(0.5);

    const body = {
      'uid': gameState.uid,
      'displayName': gameState.userDisplayName,
      'scene': this.playerScene,
      'score': this.playerScore,
      'time_raw': this.playerTime_raw,
      'health': this.playerHealth,
      'bonus_score': this.playerBonus
    };

    fetch('/data/score', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        status.setText("Data not posted");
      }
    }).then(resData => {
      let newStatusText = ''

      resData.msg ? newStatusText += "First time for everything!" : null
      if (resData.score < this.playerScore) {
        newStatusText += `Beat your old score by: ${this.playerScore - resData.score}\n`;
      } else if (resData.time_raw < this.playerTime_raw || resData.time_raw > this.playerTime_raw || resData, bonusScore < this.playerBonus) {
        newStatusText += `Didn't beat your record, but: \n`;
        resData.time_raw > this.playerTime_raw ? newStatusText += `${gameFunctions.timeConvert(resData.time_raw - this.playerTime_raw)} faster\n` : null;
        resData.health < this.playerHealth ? newStatusText += `Got ${this.playerHealth - resData.health} more health\n` : null;
        if (resData.bonusScore) {
          resData.bonusScore < this.playerBonus ? newStatusText += `Got ${this.playerBonus - resData.bonusScore} more bonus points\n` : null;
        }
      }

      status.setText(newStatusText);
    }).catch(err => console.log(err));

    playButton.setInteractive();
    backButton.setInteractive();

    this.sceneIndex = config.sceneKeys.indexOf(this.playerScene);
    if (this.sceneIndex <= config.sceneKeys.length) {
      this.nextScene = config.sceneKeys[this.sceneIndex + 1];
    }

    playButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop('Level_transition');
      this.scene.start(this.nextScene, this.forwardData);
    }, this);

    backButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop('Level_transition');
      this.scene.get(config.sceneKeys[this.sceneIndex]).scene.restart(this.forwardData);
    }, this);
  }

}