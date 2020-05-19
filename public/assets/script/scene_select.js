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
      cameraWidth: 480,
      cameraHeight: 1900,

      buttonDepth: 4,
      overviewImageDepth: 2
    }
  }

  preload() {
    this.load.image('back_button', '/assets/sprites/buttons/button_back.png');
    this.load.image('start_button', '/assets/sprites/buttons/button_start.png');

    this.load.image('Scene_1', '/assets/sprites/overview/level_1.png');
    this.load.image('Scene_2', '/assets/sprites/overview/level_2.png');
    this.load.image('Scene_3', '/assets/sprites/overview/level_3.png');
    this.load.image('Scene_4', '/assets/sprites/overview/level_4.png');
    this.load.image('Scene_5', '/assets/sprites/overview/level_5.png');
    this.load.image('Scene_6', '/assets/sprites/overview/level_6.png');
    this.load.image('Scene_7', '/assets/sprites/overview/level_7.png');
    this.load.image('Scene_8', '/assets/sprites/overview/level_8.png');
    this.load.image('Scene_9', '/assets/sprites/overview/level_9.png');
    this.load.image('Scene_10', '/assets/sprites/overview/level_10.png');
    this.load.image('Scene_11', '/assets/sprites/overview/level_11.png');
    this.load.image('Scene_bonus', '/assets/sprites/overview/level_bonus.png');
  }

  async create() {
    this.camera = this.cameras.main.setBounds(0, 0, this.scene_settings.cameraWidth, this.scene_settings.cameraHeight);

    const backButton = this.add.image(config.width / 2 - 50, 20, 'back_button');
    backButton.setInteractive().setScrollFactor(0).setDepth(this.scene_settings.buttonDepth);
    const startButton = this.add.image(config.width / 2 + 50, 20, 'start_button');
    startButton.setInteractive().setScrollFactor(0).setDepth(this.scene_settings.buttonDepth).setVisible(false);

    startButton.on('pointerover', () => { startButton.alpha = 0.8 });
    startButton.on('pointerout', () => { startButton.alpha = 1 });
    backButton.on('pointerover', () => { backButton.alpha = 0.8 });
    backButton.on('pointerout', () => { backButton.alpha = 1 });

    // top bar
    this.add.rectangle(
      this.camera.centerX, 20,
      this.camera.displayWidth + 10, 40
    ).setFillStyle(0x000000, 0.85).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    const displayInfo = (data) => {
      this.sceneGroup = this.add.group("scenes");

      // background rectangle
      for (let i = 1; i < config.sceneKeys.length + 1; i++) {
        const rec = this.add.rectangle(
          this.camera.centerX, 150 * i,
          this.camera.displayWidth / 2 + 50, 130
        ).setFillStyle(0x000000, 0.1).setOrigin(0.5).setDepth(1).setData({ 'scene': i }).setInteractive();
        this.sceneGroup.add(rec);
      }

      // level images
      for (let i = 1; i < config.sceneKeys.length; i++) {
        this.add.image(160, 150 + 150 * (i - 1), `Scene_${i}`).setScale(0.3).setOrigin(0.5).setDepth(this.scene_settings.overviewImageDepth);
      }
      // bonus level image
      this.add.image(160, 150 * (config.sceneKeys.length), `Scene_bonus`).setScale(0.3).setOrigin(0.5).setDepth(this.scene_settings.overviewImageDepth);

      // stats text
      data.scenes_completed.forEach(scene => {
        if (config.sceneKeys.includes(scene)) {
          let index = config.sceneKeys.indexOf(scene);

          this.add.text(300, 150 * (index + 1),
            `Level: ${index + 1}\n` +
            `Score: ${data[scene].score}\n` +
            `Health: ${data[scene].health.toFixed(2)}\n` +
            `Duration: ${gameFunctions.timeConvert(data[scene].time_raw)}\n` +
            `Date: ${new Date(data[scene].timestamp.seconds * 1000).toLocaleDateString("en-US")}\n` +
            `Time: ${new Date(data[scene].timestamp.seconds * 1000).toLocaleTimeString("en-US")}`, { color: 'black', fontSize: 12 }).setOrigin(0.5);
        }
      })

      const lastSceneCompleted = data.scenes_completed[data.scenes_completed.length - 1];
      const playableIndex = config.sceneKeys.indexOf(lastSceneCompleted) + 1;

      // select scene
      this.selectedScene = null;
      this.selectedScenesPreviousScene = null;
      this.sceneGroup.getChildren().forEach(ele => {
        // scene starts at 1
        if (ele.getData('scene') - 1 <= playableIndex) {
          ele.on('pointerup', () => {
            startButton.setVisible(true);
            this.sceneGroup.getChildren().forEach(ele => { ele.fillAlpha = 0.1 });
            this.tweens.add({
              targets: ele,
              duration: 50,
              y: ele.y + 2,
              yoyo: true
            });
            ele.fillAlpha = 0.4

            this.selectedScene = config.sceneKeys[ele.getData('scene') - 1];
            this.selectedScenesPreviousScene = config.sceneKeys[ele.getData('scene') > 2 ? ele.getData('scene') - 2 : 0];
          })
        }
      })

      startButton.on('pointerup', () => {
        if (data[this.selectedScenesPreviousScene]) {
          this.sound.pauseAll();
          const forwardData = {
            scene: this.selectedScenesPreviousScene,
            score: data[this.selectedScenesPreviousScene].score,
            bonus: data[this.selectedScenesPreviousScene].bonus_score,
            health: data[this.selectedScenesPreviousScene].health,
            time_raw: data[this.selectedScenesPreviousScene].time_raw
          }
          this.scene.stop();
          this.scene.get(this.selectedScene).scene.restart(forwardData);
        }
      })

    }

    await fetch('/data/level-data', { method: "GET", credentials: 'same-origin' })
      .then(res => { if (res.status === 200) { return res.json() } })
      .then(data => { displayInfo(data) })
      .catch(err => {
        console.log(err);
        this.scene.stop();
        this.scene.get('Menu').scene.restart(forwardData);
      });

    this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) { this.camera.scrollY += deltaY / 2 }, this);

    console.log(this.sound)
    backButton.on('pointerup', () => {
      console.log(this.sound)
      this.sound.pauseAll()
      this.scene.stop();
      this.scene.get('Menu').scene.restart();
    })
  }

  update() {
    null;
  }
}