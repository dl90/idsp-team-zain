'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

class ScoreBoard extends Phaser.Scene {
  constructor() {
    super({ key: 'ScoreBoard' });
  }

  preload() { }

  create() {
    this.add.text(config.width / 2, config.height / 2 - 110, 'High score', { color: 'black', fontSize: '16px' }).setOrigin(0.5);

    fetch('/data/score', {
      method: 'GET',
      credentials: "same-origin",
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null
      }
    }).then(data => {
      if (data) {
        this.scoresArr = data.data;
        for (let i = 0; i < this.scoresArr.length; i++) {
          this.add.text(config.width / 2, config.height / 2 - 70 + (20 * i), `${i + 1}   ${this.scoresArr[i].displayName}   ${this.scoresArr[i].score}`, { color: 'black', fontSize: '16px' }).setOrigin(0.5);
        }
      } else {
        this.add.text(config.width / 2, config.height / 2 - 70, 'An error occured', { color: 'black', fontSize: '16px' }).setOrigin(0.5);
      }
    }).catch(err => {
      console.log(err)
    })



  }
}