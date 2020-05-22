'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

class Score_board extends Phaser.Scene {
  constructor() {
    super({ key: 'Score_board' });
  }

  init(data) {
    this.forwardData = data;

    data.scene ? this.playerScene = data.scene : null;
    data.score ? this.playerScore = data.score : null;
    data.bonus > 0 ? this.playerBonus = data.bonus : this.playerBonus = 0;
    data.health ? this.playerHealth = data.health : null;
    data.time_raw ? this.playerTime_raw = data.time_raw : null;
    typeof data.audioToggle === 'boolean' ? this.audioToggle = data.audioToggle : this.audioToggle = true;
  }

  preload() {
    const assetPath = './assets/sprites';
    this.load.image('back_button', assetPath + '/buttons/button_back.png');
    this.load.image('logout_button', assetPath + '/buttons/button_logout.png');
    this.load.image('level_button', assetPath + '/buttons/button_level.png');
    this.load.image('total_button', assetPath + '/buttons/button_total.png');
  }

  create() {
    this.add.text(config.width / 2, config.height / 2 - 120, 'High score', { color: 'black', fontSize: 16 }).setOrigin(0.5);
    const rankingsText = this.add.text(config.width / 2, config.height / 2, '', { color: 'black', fontSize: 16 }).setOrigin(0.5);

    const totalButton = this.add.sprite(config.width / 2, config.height - 30, 'total_button'),
      levelButton = this.add.sprite(config.width / 2, config.height - 30, 'level_button'),
      backButton = this.add.sprite(config.width / 2 - 96, config.height - 30, 'back_button'),
      logoutButton = this.add.sprite(config.width / 2 + 96, config.height - 30, 'logout_button');

    totalButton.setInteractive();
    levelButton.setInteractive().setVisible(false);
    backButton.setInteractive();
    logoutButton.setInteractive();

    const body = { scene: this.playerScene };
    let [topTen_byLevel, topTen_byTotal] = [null, null];

    function fillRankings(arr) {
      let newRankText = '';
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          newRankText += `${i + 1} \t${arr[i].displayName} \t-\t ${arr[i].score}\n`;
        }
        rankingsText.setText(newRankText);
      }
    }

    fetch('/data/leader-board', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    }).then(res => {

      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    }).then(data => {
      if (data) {
        [topTen_byLevel, topTen_byTotal] = [data.topTen_level, data.topTen_total];
        fillRankings(topTen_byLevel);
      } else {
        rankingsText.setText('An error occurred,\nmost likely due to too many requests');
      }
    }).catch(err => { console.log(err) });

    totalButton.on('pointerup', () => {
      rankingsText.setText('');
      fillRankings(topTen_byTotal);
      totalButton.visible ? totalButton.setVisible(false) : null;
      !levelButton.visible ? levelButton.setVisible(true) : null;
    }, this);

    levelButton.on('pointerup', () => {
      rankingsText.setText('');
      fillRankings(topTen_byLevel);
      levelButton.visible ? levelButton.setVisible(false) : null;
      !totalButton.visible ? totalButton.setVisible(true) : null;
    }, this);

    backButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop();
      this.scene.get('Level_transition').scene.restart(this.forwardData);
    }, this);

    logoutButton.on('pointerup', () => {
      fetch("/auth/logout", { method: "GET" })
        .then(() => {
          this.sound.stopAll();
          this.scene.stop();
          this.scene.get("Menu").scene.restart();
        }).catch(err => {
          console.log(err);
        });
    }, this);
  }
}