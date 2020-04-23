'use strict'
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 23, 2020
 */

const gameFunctions = {
  // loading screen
  loading: function loading() {
    this.loadingText = this.make.text({
      x: config.width / 2 - 50, y: config.height / 2,
      text: 'Loading:',
      style: { fontSize: '24px', align: 'center', fill: '#000000' }
    });

    this.percentText = this.make.text({
      x: config.width / 2 + 50, y: config.height / 2,
      text: '0%',
      style: { fontSize: '24px', align: 'center', fill: '#000000' }
    });

    this.assetText = this.make.text({
      x: config.width / 2, y: config.height / 2 + 50,
      text: '',
      style: { fontSize: '14px', align: 'center', fill: '#000000' }
    });

    this.loadingText.setOrigin(0.5);
    this.percentText.setOrigin(0.5);
    this.assetText.setOrigin(0.5);
    this.load.on('progress', value => { this.percentText.setText(parseInt(value * 100) + '%') });
    this.load.on('fileprogress', file => { this.assetText.setText('Loading: ' + file.key) });
    this.load.on('complete', () => { this.loadingText.destroy(); this.percentText.destroy(); this.assetText.destroy() });
  },


}
