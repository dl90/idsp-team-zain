class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    this.load.image('logo', '')
  }

  create() {
    this.add.text((game.config.width / 2 - 200), (game.config.height / 2), 'Click to Start!', { fontSize: '35px', fill: '#000000' });
    this.input.on('pointerdown', () => {
      this.scene.stop('StarScene')
      this.scene.start('GameScene')
    })
  }
}
