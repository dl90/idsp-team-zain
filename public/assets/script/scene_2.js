'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 24, 2020
 * @TODO implement score calc
 */

const scene_2_settings = {
  canvasWidth: 480,
  canvasHeight: 270,
  worldWidth: 32 * 31,
  worldHeight: 32 * 16,
  moveSpeed: 100,
  movementHealthCostRatio: 0.000005,
  diagonalMoveSpeed: 70.71,
  twoKeyMultiplier: 0.707,
  playerSpawnPosition: [1, 2],
  enemyMoveSpeed: 85,
  enemyChaseDistance: 100,
  boneHealthRegen: 30,
  familySpawnPosition: [],

  enemy: [],
  enemyTweenDurationMultiplier: 500,
  enemyTweenLoopDelay: 20000
}
class Scene_2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene_2' });
  }

  preload() {
    gameFunctions.loading.call(this);
    gameFunctions.loadHealthTextures.call(this);

    this.load.spritesheet('f_dog', './assets/sprites/dog/re_f_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('b_dog', './assets/sprites/dog/re_b_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('l_dog', './assets/sprites/dog/re_l_sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('level_1', './assets/tileset/level_1.png');
    this.load.tilemapTiledJSON('scene_2', './assets/tilemaps/test_level_2.json');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null

    this.camera = this.cameras.main.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);
    this.physics.world.setBounds(0, 0, scene_2_settings.worldWidth, scene_2_settings.worldHeight);

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.player = this.physics.add.sprite(scene_2_settings.playerSpawnPosition[0] * 32 - 16, scene_2_settings.playerSpawnPosition[1] * 32 - 16, 'f_dog').setSize(30, 30).setDepth(1);
    gameState.player.setCollideWorldBounds(true);

    // readds healthBar
    gameState.healthBar = this.add.sprite(40, 20, 'health_100').setScrollFactor(0).setDepth(10);
    gameState.healthVal = 80

    // follows player
    this.cameras.main.startFollow(gameState.player, true, 0.05, 0.05);

    const map = this.add.tilemap('scene_2');
    const tileSet = map.addTilesetImage('level_1');

    const background = map.createStaticLayer('background', [tileSet], 0, 0)//.setDepth(-1);
    const collider = map.createStaticLayer('collider', [tileSet], 0, 0);

    collider.setCollisionByProperty({ collide: true })

    const walls = this.physics.add.staticGroup();
    collider.forEachTile((tile) => {
      const tileWorldPos = collider.tileToWorldXY(tile.x, tile.y),
        collisionGroup = tileSet.getTileCollisionGroup(tile.index);

      if (!collisionGroup || collisionGroup.objects.length <= 0) { return; }
      else {
        const objects = collisionGroup.objects;
        objects.forEach((object) => {
          console.log(tileWorldPos)
          console.log(object)
          object.rectangle ? walls.create(tileWorldPos.x + 16, tileWorldPos.y + 16, null).setSize(object.width, object.height).setOffset(object.x, object.y).setOrigin(0).setVisible(false) : null
        })
      }
    })
    this.physics.add.collider(gameState.player, walls)

    this.animate();
  }

  animate() {
    this.anims.create({
      key: 'f_move',
      frames: this.anims.generateFrameNumbers('f_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'b_move',
      frames: this.anims.generateFrameNumbers('b_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
    this.anims.create({
      key: 'l_move',
      frames: this.anims.generateFrameNumbers('l_dog', { start: 0, end: 2 }),
      frameRate: Math.round(scene_1_settings.moveSpeed / 15),
      repeat: -1
    });
  }

  update() {
    if (gameState.healthVal > 0) {
      this.physics.resume()
      gameFunctions.control(gameState, scene_2_settings);
      gameFunctions.activeHealthTextures(gameState);
    } else {
      this.levelText ? this.levelText.destroy() : null;
      this.levelText = this.add.text(scene_2_settings.canvasWidth / 2 - 70, scene_2_settings.canvasHeight / 2 - 50, 'Game Over', { fontSize: 30, color: '#4B004F' }).setScrollFactor(0);
      this.physics.pause();
      this.anims.pauseAll();
      // this.tweens.pauseAll();
      // gameState.emitter.emit('death_bgm');
    }
  }

}