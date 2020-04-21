/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */


class Scene_2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_2' });
  }

  preload() {}
  create() {
    this.scene.remove("Scene_1");
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    sceneState.levelText = this.add.text(width / 2 - 50, height / 2 - 50, 'YOU WIN', { fontSize: 30, color: '#7E00C2' }).setScrollFactor(0);
  }
  update() {}
}