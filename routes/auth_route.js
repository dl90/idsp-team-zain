"use strict";

const express = require("express"),
  router = express.Router(),
  admin = require("firebase-admin"),
  ips = [];
let deploy;
process.env.apiKey ? deploy = true : deploy = false;

module.exports = function (auth) {
  const token = (user, res) => {
    if (user) {
      auth.currentUser.getIdToken(true)
        .then(function (idToken) {
          res.cookie('idToken', idToken, { httpOnly: true, secure: deploy, sameSite: 'strict', maxAge: 60 * 60 * 1000 }).json({ displayName: user.displayName, uid: user.uid }).end();
        }).catch(err => {
          console.log(err);
          res.status(401).end();
        })
    } else {
      res.status(401).end();
    }
  }


  router.get('/token', (req, res) => {
    if (req.cookies.idToken) {
      admin.auth().verifyIdToken(req.cookies.idToken)
        .then((decodedToken) => {
          const { uid, name } = decodedToken;
          res.json({ displayName: name, uid });
        }).catch((err) => {
          console.log(err);
          res.status(269).end();
        });
    } else {
      res.status(269).end();
    }
  })


  router.post('/login', (req, res) => {
    const { email, pass } = (req.body);
    !ips.includes(req.clientIp) ? ips.push(req.clientIp) : console.log(req.clientIp);
    pass.trim().length < 6 ? (() => { console.log('Bad pass /login: ', pass); return res.status(401) })() : null;
    email.trim().length < 6 ? (() => { console.log('Bad email /login: ', email); return res.status(401) })() : null;

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => { auth.onAuthStateChanged(user => { token(user, res) }) }, (rejected) => { res.status(401).json({ rejected }) })
      .catch(err => console.log(err));
  });


  router.get('/logout', (req, res) => {
    res.clearCookie('idToken');
    res.redirect("/");
  });


  router.post("/sign_up", (req, res) => {
    const { name, email, pass } = (req.body);
    !ips.includes(req.clientIp) ? ips.push(req.clientIp) : console.log(req.clientIp);
    name.trim().length < 3 ? (() => { console.log('Bad name /sign_up: ', name); return res.status(401) })() : null;
    pass.trim().length < 6 ? (() => { console.log('Bad pass /sign_up: ', pass); return res.status(401) })() : null;
    email.trim().length < 6 ? (() => { console.log('Bad email /sign_up: ', email); return res.status(401) })() : null;

    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            user.updateProfile({ displayName: name })
              .then(() => { token(user, res) })
              .catch(err => { console.log(err) });
          } else {
            res.status(401).end();
          }
        });
      }, (rejected) => { res.status(401).json({ rejected }) })
      .catch(err => { console.log(err); res.status(401) });
  });

  return router;
}