'use strict';
/* eslint-disable no-unused-vars */

const express = require("express"),
  router = express.Router(),
  firebase = require("firebase");

module.exports = function (fireStore) {

  router.get('/score', (req, res) => {
    // let doc = fireStore.collection('user_score').doc('/' +  req.body.uid)
  })

  router.get('/high_score', (req, res) => {
    fireStore.collection('high_score').onSnapshot()
  })

  router.post('/score', (req, res) => {
    const { uid, scene_1_score, scene_1_time_raw, scene_1_health } = req.body;
    fireStore.collection("user_score").get().then(users => {
      users.forEach(user => {
        console.log(user)
      })
    })

    fireStore.collection("user_score").doc('/' + uid)
      .set({
        userId: uid,
        scene_1_score: scene_1_score,
        scene_1_time_raw: scene_1_time_raw,
        scene_1_health: scene_1_health,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        res.send(JSON.stringify({ msg: 'ok' }))
      }).catch((err) => {
        res.status(401)
        console.log(err)
      })
  })

  return router
}