/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */


class Scene_1_end extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_1_end' });
  }

  preload() {}
  create() {
    this.scene.remove("Scene_1");
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    sceneState.levelText = this.add.text(width / 2 - 100, height / 2 - 50, `Health left ${gameState.healthVal.toFixed(2)}`, { fontSize: 16, color: '#7E00C2' });
  }
  update() {}
}