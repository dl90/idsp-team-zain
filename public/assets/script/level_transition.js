'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date May 11, 2020
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
    const assetPath = './assets/sprites';
    this.load.image('play_button', assetPath + '/buttons/button_play.png');
    this.load.image('back_button', assetPath + '/buttons/button_back.png');
    this.load.image('logout_button', assetPath + '/buttons/button_logout.png');
    this.load.image('level_button', assetPath + '/buttons/button_level.png');
    this.load.image('total_button', assetPath + '/buttons/button_total.png');

    this.load.image('leader_board', assetPath + '/icons/leader_board.png');
    this.load.image('redo', assetPath + '/icons/redo.png');
  }

  create() {
    // text
    this.add.text(config.width / 2, config.height / 2 - 120, `Score: \t${this.playerScore}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 100, `Health: \t${this.playerHealth.toFixed(2)}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 80, `Time: \t${gameFunctions.timeConvert(this.playerTime_raw)}`, { fontSize: 16, color: 'black' }).setOrigin(0.5);
    const status = this.add.text(config.width / 2, config.height / 2, '', { fontSize: 14, color: 'black' }).setOrigin(0.5);

    // button
    const playButton = this.add.sprite(config.width / 2, config.height - 50, 'play_button'),
      redoButton = this.add.sprite(config.width / 2 - 96, config.height - 40, 'redo'),
      leaderBoardButton = this.add.sprite(config.width / 2 + 96, config.height - 40, 'leader_board'),
      logoutButton = this.add.sprite(config.width / 2, config.height - 30, 'logout_button');

    playButton.setInteractive();
    redoButton.setInteractive();
    leaderBoardButton.setInteractive();
    logoutButton.setInteractive();

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

      resData.msg ? newStatusText += "First time for everything!\n" : null;
      if (resData.score < this.playerScore) {
        newStatusText += `Beat your old score by: ${this.playerScore - resData.score}\n`;
      } else if (resData.time_raw > this.playerTime_raw || resData.health < this.playerHealth || resData.bonus_score < this.playerBonus) {
        newStatusText += `Didn't beat your old record, but:\n`;
        resData.time_raw > this.playerTime_raw ? newStatusText += `\tyour ${gameFunctions.timeConvert(resData.time_raw - this.playerTime_raw)} faster\n` : null;
        resData.health < this.playerHealth ? newStatusText += `\tgot ${this.playerHealth - resData.health} more health\n` : null;
        if (resData.bonus_score) {
          resData.bonus_score < this.playerBonus ? newStatusText += `\tgot ${this.playerBonus - resData.bonusScore} more bonus points\n` : null;
        }
      } else {
        newStatusText += 'Nothing new here\n';
      }

      status.setText(newStatusText);
    }).catch(err => console.log(err));

    // finds next scene through array
    this.sceneIndex = config.sceneKeys.indexOf(this.playerScene);
    if (this.sceneIndex < config.sceneKeys.length) {
      this.nextScene = config.sceneKeys[this.sceneIndex + 1];
    } else {
      null; // @TODO credits scene
    }

    playButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop(this.scene.key);
      this.scene.start(this.nextScene, this.forwardData);
    }, this);

    redoButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop(this.scene.key);
      this.scene.get(this.playerScene).scene.restart(this.forwardData);
    }, this);

    leaderBoardButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop(this.scene.key);
      this.scene.get('ScoreBoard').scene.restart(this.forwardData);
    }, this);

    logoutButton.on('pointerup', () => {
      fetch("/auth/logout", { method: "GET" })
        .then(() => {
          this.sound.stopAll();
          this.scene.stop(this.scene.key);
          this.scene.get("Menu").scene.restart();
        }).catch(err => {
          console.log(err);
        });
    }, this);
  }

}