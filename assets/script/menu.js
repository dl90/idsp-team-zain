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
    // var progressBar = this.add.graphics();
    // var progressBox = this.add.graphics();
    // progressBox.fillStyle(0xE1E1E1, 0.8);
    // progressBox.fillRect(100, 200, 120, 20);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2 - 50,
      y: height / 2,
      text: 'Loading:',
      style: {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2 + 50,
      y: height / 2,
      text: '0%',
      style: {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        fontSize: '10px',
        fontFamily: 'Arial',
        fill: '#000000'
      }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      // progressBar.clear();
      // progressBar.fillStyle(0xffffff, 1);
      // progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading: ' + file.key);
    });

    this.load.on('complete', function () {
      // progressBar.destroy();
      // progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.image('logo', './sprites/logo/B&W_LOGO_FINAL.png');
    this.load.image('play_button', './sprites/buttons/button_play.png');
    this.load.image('audio_button_on', './sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', './sprites/buttons/sound_off.png');
    this.load.audio('intro_bgm', './bmg/1_Intro_1.mp3');
  }

 
  create() {
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
    emitter.on('play_bmg', () => { intro_bgm.play() }, this);
    emitter.on('pause_bmg', () => {
      intro_bgm.pause();
      playing = false;
      audioButton.setTexture('audio_button_off').setScale(0.6)
    }, this)
    emitter.on('resume_bmg', () => { 
      intro_bgm.resume();
      playing = true
      audioButton.setTexture('audio_button_on').setScale(0.6)
    }, this)

    let playing = true;
    audioButton.on('pointerup', () => { 
      if (playing) {
        emitter.emit('pause_bmg')
      } else {
        emitter.emit('resume_bmg')
      }
    });

    if(playing) {
      emitter.emit('play_bmg')
    }

    // start department
    // this.add.text((game.config.width / 2 - 200), (game.config.height / 2 + 300), 'Click to Start!', { fontSize: '35px', fill: '#000000' });
    playButton.on('pointerup', () => {
      this.scene.stop('Menu');
      intro_bgm.stop();
      this.scene.start('Scene_1');
    })

  }
}
