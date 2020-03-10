
class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('logo', 'https://github.com/dl90/idsp-team-zain/blob/gh-pages/assets/logo/B&W_LOGO_FINAL.png?raw=true');
    this.load.audio('intro_bgm', 'https://github.com/dl90/idsp-team-zain/blob/gh-pages/assets/bmg/1_intor_1.mp3?raw=true');
  }

  create() {
    gameState.intro_bmg = this.sound.add('intro_bmg');
    gameState.intro_bmg.play();
    gameState.logo = this.add.image(600, 300, 'logo');

    this.add.text((game.config.width / 2 - 200), (game.config.height / 2), 'Click to Start!', { fontSize: '35px', fill: '#000000' });
    this.input.on('pointerdown', () => {
      this.scene.stop('StarScene');
      this.scene.start('GameScene');
    })
  }
}
