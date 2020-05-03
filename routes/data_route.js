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
    // fireStore.collection('high_score').onSnapshot()
  })

  router.post('/score', (req, res) => {
    const { uid, scene_1_score, scene_1_time_raw, scene_1_health, scene_1_bonusScore } = req.body;
    fireStore.collection("user_score").doc('/' + uid).get().then(user => {
      if (!user.exists) {
        fireStore.collection("user_score").doc('/' + uid)
          .set({
            'scene_1_score': scene_1_score,
            'scene_1_time_raw': scene_1_time_raw,
            'scene_1_health': scene_1_health,
            'scene_1_bonusScore': scene_1_bonusScore,
            'timestamp': firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            res.send(JSON.stringify({ msg: 'ok' }))
          }).catch((err) => {
            res.status(401).end();
            console.log(err)
          })
      } else {
        const stored = user.data(),
          diff = {};
        stored.scene_1_time_raw > scene_1_time_raw ? diff.scene_1_time_raw = scene_1_time_raw : null;
        stored.scene_1_health < scene_1_health ? diff.scene_1_health = scene_1_health : null;
        stored.scene_1_score < scene_1_score ? diff.scene_1_score = scene_1_score : null;
        stored.scene_1_bonusScore < scene_1_bonusScore ? diff.scene_1_bonusScore = scene_1_bonusScore : null;

        fireStore.collection("user_score").doc('/' + uid)
          .update(diff)
          .then(() => res.send(JSON.stringify(diff)))
          .catch((err) => {
            res.status(401).end();
            console.log(err)
          });
      }
    })
  })

  return router
}