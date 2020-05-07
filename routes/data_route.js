'use strict';
/* eslint-disable no-unused-vars */

const express = require("express"),
  router = express.Router(),
  firebase = require("firebase"),
  admin = require("firebase-admin");

module.exports = function (fireStore) {

  router.get('/score', (req, res) => {
    fireStore.collection('user_score').orderBy("scene_1_score", "desc").onSnapshot(async (snapshot) => {
      const topTen = []
      await snapshot.forEach(doc => {
        // console.log(doc.data())
        const entry = { displayName: doc.data().displayName, score: doc.data().scene_1_score };
        topTen.push(entry)
      })

      topTen.sort((x, y) => {
        let result
        x.scene_1_score > y.scene_1_score ? result = 1 : null;
        y.scene_1_score > x.scene_1_score ? result = -1 : null;
        x.scene_1_score == y.scene_1_score ? result = 0 : null;
        return result
      });

      topTen.length > 10 ? topTen.length = 10 : null
      console.log(topTen)
      res.send(JSON.stringify({ data: topTen }));
    })
  })

  router.get('/high_score', (req, res) => {
    // fireStore.collection('high_score').onSnapshot()
  })

  router.post('/score', (req, res) => {
    const { displayName, uid, scene_1_score, scene_1_time_raw, scene_1_health, scene_1_bonusScore } = req.body;
    fireStore.collection("user_score").doc('/' + uid).get().then(user => {
      if (!user.exists) {
        fireStore.collection("user_score").doc('/' + uid)
          .set({
            'displayName': displayName,
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
          .catch((err) => { res.status(401).end() });
      }
    })
  })

  return router
}