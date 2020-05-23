# Crazy Zain

### Built with

- [Phaser 3.23.0](https://phaser.io/download/stable)
- [Express](https://www.npmjs.com/package/express)
- [Firebase](https://www.npmjs.com/package/firebase)

### Map JSON files generated with

- [Tiled](https://www.mapeditor.org/)

The game is hosted live on [argot.codes](argot.codes)

The server hosts 2 main categories of endpoints: authentication and game data.

All files are served statically due to how Phaser scenes are configured for this project. There are ways to add scenes from [external files](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/) which would allow for dynamic scene loading but due to time I decided to stick with serving everything statically.

This game uses Phasers built in [Arcade physics](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html), a simple and performant physics engine that sometimes bugs out on collisions.

### Dependencies

- [compression](https://www.npmjs.com/package/compression) => for compressing assets in HTTP responses
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) => parsing JWT
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) => limit number of endpoint request
- [Firebase-admin](https://www.npmjs.com/package/firebase-admin) => authentication verification
- [helmet](https://www.npmjs.com/package/helmet) => protect your head(ers)

### Optional

- [request-ip](https://www.npmjs.com/package/request-ip) => didn't really use it much
- [firebase-functions](https://www.npmjs.com/package/firebase-functions) => didn't get a chance to fully implement cloud functions

### Audio/art

Two original soundtracks, original SFX, and all original art are from the D3 team members.

### Others

This project also contains my attempt to implement AStar pathfinding but was scrapped due to time.
