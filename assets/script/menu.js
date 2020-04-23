'use strict'
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @note Game Menu
 */

class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  preload() {
    gameFunctions.loading.call(this);

    this.load.image('logo', './sprites/logo/B&W_LOGO_FINAL.png');
    this.load.image('play_button', './sprites/buttons/button_play.png');
    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('intro_bgm', './bgm/Meme_Intro.mp3');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    const sound_config = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }

    this.add.image((config.width / 2 + 5), (config.height * 0.22), 'logo').setScale(0.2);
    const intro_bgm = this.sound.add('intro_bgm', sound_config);
    const playButton = this.add.sprite((config.width / 2), config.height - 100, 'play_button');
    const audioButton = this.add.sprite((config.width - 20), config.height - 20, 'audio_button_on').setScale(0.6);

    playButton.setInteractive();
    audioButton.setInteractive();

    // audio department
    const emitter = new Phaser.Events.EventEmitter();
    emitter.on('play_bgm', () => { intro_bgm.play() }, this);
    emitter.on('pause_bgm', () => {
      intro_bgm.pause();
      playing = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    emitter.on('resume_bgm', () => {
      intro_bgm.resume();
      playing = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)

    let playing = true;
    audioButton.on('pointerup', () => { playing ? emitter.emit('pause_bgm') : emitter.emit('resume_bgm') });
    playing ? emitter.emit('play_bgm') : null;

    // transition
    playButton.on('pointerup', () => {
      this.scene.stop('Menu');
      intro_bgm.stop();
      this.scene.start('Scene_1');
    })

  }
}
