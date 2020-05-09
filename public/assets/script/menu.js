'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

/**
 * @author Don (dl90)
 * @date April 15, 2020
 * @note Game Menu
 */

class Menu extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }) }

  preload() {
    gameFunctions.loading.call(this);
    this.load.html('login_form', '/assets/util/login_form.html');
    this.load.html('signup_form', '/assets/util/signup_form.html');

    this.load.image('logo', '/assets/sprites/logo/B&W_LOGO_FINAL.png');
    this.load.image('play_button', '/assets/sprites/buttons/button_play.png');
    this.load.image('logout_button', '/assets/sprites/buttons/button_logout.png');
    this.load.image('audio_button_on', '/assets/sprites/buttons/sound_on.png');
    this.load.image('audio_button_off', '/assets/sprites/buttons/sound_off.png');
    this.load.audio('intro_bgm', '/assets/bgm/Meme_Intro.mp3');
  }

  create() {
    this.loadingText ? (() => { this.loadingText.destroy(); delete this.loadingText; })() : null;
    this.percentText ? (() => { this.percentText.destroy(); delete this.percentText; })() : null;
    this.assetText ? (() => { this.assetText.destroy(); delete this.assetText; })() : null;

    const sound_config = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    };

    this.add.image((config.width / 2 + 5), (config.height * 0.22), 'logo').setScale(0.2);
    const intro_bgm = this.sound.add('intro_bgm', sound_config);
    const playButton = this.add.sprite((config.width / 2), config.height - 100, 'play_button');
    const logoutButton = this.add.sprite((config.width / 2), config.height - 80, 'logout_button');
    const audioButton = this.add.sprite((config.width - 20), config.height - 20, 'audio_button_on').setScale(0.5);

    playButton.setInteractive().setVisible(false);
    logoutButton.setInteractive().setVisible(false);
    audioButton.setInteractive();

    const prompt = this.add.text(config.width / 2, config.height / 2, '', { color: 'black', fontSize: '16px' }).setOrigin(0.5);
    const loginForm = this.add.dom(config.width / 2, config.height / 2 + 50).createFromCache('login_form').setOrigin(0.5).setVisible(false);
    const signupForm = this.add.dom(config.width / 2, config.height / 2 + 63).createFromCache('signup_form').setOrigin(0.5).setVisible(false);

    const msgFlash = (target) => {
      this.tweens.add({
        targets: target,
        alpha: 0,
        duration: 250,
        loop: 2,
        ease: 'Linear',
        yoyo: true,
        onComplete: () => { target.alpha = 1 }
      });
    }

    fetch("/auth/token", { method: "GET" })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          prompt.setText('Please login or create an account to proceed')
          loginForm.setVisible(true);
          login();
          signUp();
        }
      })
      .then((resData) => {
        if (resData) {
          prompt.setText(`Welcome back ${resData.displayName}`)
          gameState.userDisplayName = resData.displayName;
          gameState.uid = resData.uid;
          playButton.setVisible(true);
          logoutButton.setVisible(true);
        }
      }).catch((err) => { console.log(err) })

    function login() {
      loginForm.addListener("click");
      loginForm.on("click", function (event) {
        const email = loginForm.getChildByName("email").value.trim(),
          pass = loginForm.getChildByName("pass").value.trim();
        if (event.target.id === "login-submit" && (email.length !== 0 && pass.length >= 6)) {
          event.preventDefault();

          fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ email, pass })
          }).then(res => {
            if (res.status === 200) {
              loginForm.removeListener('click');
              document.querySelector('#login_form').reset();
              loginForm.setVisible(false);
              return res.json();
            } else if (res.status === 401) {
              prompt.setText('Invalid username or password');
              msgFlash(prompt);
            } else if (res.status == 429) {
              prompt.setText('Too many attempts, 30min timeout');
              msgFlash(prompt);
            } else {
              console.log('something else');
            }
          }, (reject) => {
            prompt.setText(reject.reason);
            msgFlash(prompt);
          }).then((resData) => {
            if (resData) {
              prompt.setText(`Welcome ${resData.displayName}`);
              gameState.userDisplayName = resData.displayName;
              gameState.uid = resData.uid;
              playButton.setVisible(true);
              logoutButton.setVisible(true);
            }
          }).catch(err => { console.log(err) });
        } else if (event.target.id === "login-submit") {
          prompt.setText('Invalid input');
          msgFlash(prompt);
        } else if (event.target.id === "login-to-sign-up") {
          prompt.setText('Sign up');
          loginForm.setVisible(false);
          signupForm.setVisible(true);
        }
      });
    }

    function signUp() {
      signupForm.addListener("click");
      signupForm.on("click", function (event) {
        const name = signupForm.getChildByName("name").value.trim(),
          email = signupForm.getChildByName("email").value.trim(),
          pass = signupForm.getChildByName("pass").value.trim();
        if (event.target.id === "sign-up-submit" && (name.length >= 3 && email.length !== 0 && pass.length >= 6)) {
          event.preventDefault();

          fetch("/auth/sign_up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ name, email, pass })
          }).then(res => {
            if (res.status === 200) {
              signupForm.removeListener('click');
              document.querySelector('#signup-form').reset();
              signupForm.setVisible(false);
              return res.json();
            } else if (res.status == 429) {
              prompt.setText('Too many attempts, 5min timeout');
              msgFlash(prompt);
            } else {
              prompt.setText("Signup unsuccessful");
              msgFlash(prompt);
            }
          }, (reject) => {
            prompt.setText(reject.reason);
            msgFlash(prompt);
          }).then((resData) => {
            if (resData) {
              prompt.setText(`Welcome ${resData.displayName}`);
              gameState.userDisplayName = resData.displayName;
              gameState.uid = resData.uid;
              playButton.setVisible(true);
              logoutButton.setVisible(true);
            }
          }).catch(err => {
            console.log(err);
          })

        } else if (event.target.id === "sign-up-submit") {
          prompt.setText('Invalid input');
          msgFlash(prompt);
        } else if (event.target.id === "sign-up-to-login") {
          prompt.setText('Login');
          signupForm.setVisible(false);
          loginForm.setVisible(true);
        }
      });
    }

    // audio department
    this.sound.pauseOnBlur = false;
    const emitter = new Phaser.Events.EventEmitter();
    emitter.on('play_bgm', () => { intro_bgm.play() }, this);
    emitter.on('pause_bgm', () => {
      intro_bgm.pause();
      playing = false;
      audioButton.setTexture('audio_button_off').setScale(0.5);
    }, this);
    emitter.on('resume_bgm', () => {
      intro_bgm.resume();
      playing = true;
      audioButton.setTexture('audio_button_on').setScale(0.5);
    }, this);

    let playing = true;
    audioButton.on('pointerup', () => { playing ? emitter.emit('pause_bgm') : emitter.emit('resume_bgm') });
    playing ? emitter.emit('play_bgm') : null;

    // transition
    playButton.on('pointerup', () => {
      logoutButton.removeListener('pointerup')
      this.tweens.add({
        targets: intro_bgm,
        volume: 0,
        duration: 1500,
        onComplete: () => {
          this.scene.stop('Menu');
          intro_bgm.stop();
          this.scene.start('Scene_1');
        }
      });
    });

    // logout
    logoutButton.on('pointerup', () => {
      fetch("/auth/logout", { method: "GET" })
        .then(() => {
          prompt.setText('Please login or create an account to proceed');
          loginForm.setVisible(true);
          playButton.setVisible(false);
          logoutButton.setVisible(false);
          login();
          signUp();
        }).catch(err => {
          console.log(err);
        });
    });

  }
}