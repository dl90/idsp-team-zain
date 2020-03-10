class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('logo', './images/logo/B&W_LOGO_FINAL.png');
    this.load.audio('intro_bgm', './bmg/1_scene_1.mp3');
  }

  create() {
    const intro_bgm = this.sound.add('intro_bgm');
    intro_bgm.play();
    this.add.image(600, 300, 'logo');
    this.add.text((game.config.width / 2 - 200), (game.config.height / 2 + 300), 'Click to Start!', { fontSize: '35px', fill: '#000000' });
    this.input.on('pointerdown', () => {
      this.scene.stop('StarScene');
      this.scene.start('GameScene');
    })
  }
}
