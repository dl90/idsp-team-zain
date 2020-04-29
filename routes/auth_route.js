const express = require("express"),
  router = express.Router(),
  ips = [];

module.exports = function (auth) {

  router.post('/login', (req, res) => {
    const { email, pass } = (req.body);

    // not supported by Node.js
    // auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    if (!ips.includes( req.clientIp)) {
      ips.push(req.clientIp)
    } else {
      console.log(req.clientIp)
    }

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            res.status(200).json({ displayName: user.displayName });
          } else {
            res.status(401);
          }
        })
      }, (rejected) => { res.status(401).json(rejected) })
      .catch(err => console.log(err));
  });

  router.post("/sign_up", (req, res) => {
    const { name, email, pass } = (req.body);

    if (!ips.includes( req.clientIp)) {
      ips.push(req.clientIp)
    } else {
      console.log(req.clientIp)
    }

    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            user.updateProfile({ displayName: name })
              .then(() => {
                const displayName = user.displayName;
                res.status(200).json({ displayName })
              }).catch(err => { console.log(err) });
          } else {
            res.status(401);
          }
        });
      }, (rejected) => { res.status(401).json(rejected) })
      .catch(err => console.log(err));
  });

  return router
}