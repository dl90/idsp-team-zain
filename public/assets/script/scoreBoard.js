'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

class ScoreBoard extends Phaser.Scene {
  constructor() {
    super({ key: 'ScoreBoard' });
  }

  preload() {

  }

  create() {
    fetch('/data/score', {
      method: 'GET',
      credentials: "same-origin",
    }).then(res => { 
      return res.json();
    }).then(data => {
      console.log(data);
    }).catch(err => {
      console.log(err)
    })
  }
}