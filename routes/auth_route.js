"use strict";

const express = require("express"),
  router = express.Router(),
  ips = [];

module.exports = function (auth) {

  router.post('/login', (req, res) => {
    const { email, pass } = (req.body);
    !ips.includes(req.clientIp) ? ips.push(req.clientIp) : console.log(req.clientIp);

    // not supported by Node.js
    // auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        auth.onAuthStateChanged(user => {
          if (user) {
            res.status(200).json({ displayName: user.displayName, uid: user.uid });
          } else {
            res.status(401).end();
          }
        })
      }, (rejected) => { res.status(401).json({ rejected }) })
      .catch(err => console.log(err));
  });

  router.post("/sign_up", (req, res) => {
    const { name, email, pass } = (req.body);
    !ips.includes(req.clientIp) ? ips.push(req.clientIp) : console.log(req.clientIp);

    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            user.updateProfile({ displayName: name })
              .then(() => {
                res.json({ displayName: user.displayName, uid: user.uid });
              }).catch(err => { console.log(err) });
          } else {
            res.status(401).end();
          }
        });
      }, (rejected) => { res.status(401).json({ rejected }) })
      .catch(err => console.log(err));
  });

  return router
}