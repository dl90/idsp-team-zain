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
    function loading() {
      sceneState.loadingText = this.make.text({
        x: settings.canvasWidth / 2 - 50,
        y: settings.canvasHeight / 2,
        text: 'Loading:',
        style: {
          fontSize: '24px',
          align: 'center',
          fill: '#000000'
        }
      });

      sceneState.percentText = this.make.text({
        x: settings.canvasWidth / 2 + 50,
        y: settings.canvasHeight / 2,
        text: '0%',
        style: {
          fontSize: '24px',
          align: 'center',
          fill: '#000000'
        }
      });

      sceneState.assetText = this.make.text({
        x: settings.canvasWidth / 2,
        y: settings.canvasHeight / 2 + 50,
        text: '',
        style: {
          fontSize: '14px',
          align: 'center',
          fill: '#000000'
        }
      });

      sceneState.loadingText.setOrigin(0.5, 0.5);
      sceneState.percentText.setOrigin(0.5, 0.5);
      sceneState.assetText.setOrigin(0.5, 0.5);
      this.load.on('progress', value => { sceneState.percentText.setText(parseInt(value * 100) + '%') });
      this.load.on('fileprogress', file => { sceneState.assetText.setText('Loading: ' + file.key) });
      this.load.on('complete', () => { sceneState.loadingText.destroy(); sceneState.percentText.destroy(); sceneState.assetText.destroy() });
    }
    loading.apply(this);

    this.load.image('logo', './sprites/logo/B&W_LOGO_FINAL.png');
    this.load.image('play_button', './sprites/buttons/button_play.png');
    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('intro_bgm', './bgm/Meme_Intro.mp3');
  }

 
  create() {
    sceneState.loadingText ? (() => { sceneState.loadingText.destroy(); delete sceneState.loadingText; })() : null
    sceneState.percentText ? (() => { sceneState.percentText.destroy(); delete sceneState.percentText; })() : null
    sceneState.assetText   ? (() => { sceneState.assetText.destroy();   delete sceneState.assetText;   })() : null

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const sound_config = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }

    this.add.image( (width / 2 + 5), (height * 0.22),  'logo').setScale(0.2);
    const intro_bgm = this.sound.add('intro_bgm', sound_config);
    const playButton = this.add.sprite( (width / 2), height - 100, 'play_button');
    const audioButton = this.add.sprite( (width - 20), height - 20, 'audio_button_on').setScale(0.6);

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
    audioButton.on('pointerup', () => { 
      if (playing) {
        emitter.emit('pause_bgm')
      } else {
        emitter.emit('resume_bgm')
      }
    });

    if(playing) {
      emitter.emit('play_bgm')
    }

    playButton.on('pointerup', () => {
      this.scene.stop('Menu');
      intro_bgm.stop();
      this.scene.start('Scene_1');
    })

  }
}
