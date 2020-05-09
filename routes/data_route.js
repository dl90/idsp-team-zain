'use strict';
/* eslint-disable no-unused-vars */

const express = require("express"),
  router = express.Router(),
  firebase = require("firebase"),
  admin = require("firebase-admin");

module.exports = function (fireStore) {

  router.get('/score', (req, res) => {
    fireStore.collection('user_score').orderBy("totalScore", "desc").limit(10).get().then(async (snapshot) => {
      const topTen = [];
      await snapshot.forEach(doc => {
        const entry = { displayName: doc.data().displayName, score: doc.data().scene_1_score };
        topTen.push(entry);
      })

      topTen.sort((x, y) => {
        let result
        x.scene_1_score > y.scene_1_score ? result = 1 : null;
        y.scene_1_score > x.scene_1_score ? result = -1 : null;
        x.scene_1_score == y.scene_1_score ? result = 0 : null;
        return result;
      });

      topTen.length > 10 ? topTen.length = 10 : null;
      res.send(JSON.stringify({ data: topTen }));
    })//.catch(err => console.log(err));
  });


  router.post('/score', (req, res) => {
    const { uid, displayName, scene, score, time_raw, health, bonus_score } = req.body;
    uid.trim().length < 28 ? (() => { return res.status(401) })() : null;

    fireStore.collection("user_score").doc('/' + uid).get().then(doc => {
      const stored = doc.data(); // existing data

      if (!doc.exists) {
        const document = {
          'displayName': displayName,
          'totalScore': score,
          'timestamp': firebase.firestore.FieldValue.serverTimestamp(),
          'scenes_completed': [scene],
          [scene]: {
            score,
            bonus_score,
            health,
            time_raw,
            'timestamp': firebase.firestore.FieldValue.serverTimestamp(),
          }
        };

        fireStore.collection("user_score").doc('/' + uid)
          .set(document)
          .then(() => { res.send(JSON.stringify({ msg: 'ok' })) })
          .catch((err) => {
            res.status(401).end();
            console.log(err);
          });

      } else if (stored[scene] === undefined) {
        const scenes_completed = stored.scenes_completed; // collection.document.arrayUnion(arr_value);
        !scenes_completed.includes(scene) ? scenes_completed.push(scene) : console.log("This doesn't add up, uid: " + uid);

        const newTotalScore = stored.totalScore + score;
        const document = {
          'scenes_completed': scenes_completed,
          'totalScore': newTotalScore,
          [scene]: {
            score,
            bonus_score,
            health,
            time_raw,
            'timestamp': firebase.firestore.FieldValue.serverTimestamp(),
          }
        };

        fireStore.collection("user_score").doc('/' + uid)
          .update(document)
          .then(() => { res.send(JSON.stringify({ msg: 'ok' })) })
          .catch((err) => {
            res.status(401).end();
            console.log(err);
          });

      } else {
        const diff = { [scene]: { 'timestamp': firebase.firestore.FieldValue.serverTimestamp() } };
        if (stored[scene].score < score) {
          diff[scene].score = score;
          diff[scene].bonus_score = bonus_score;
          diff[scene].health = health;
          diff[scene].time_raw = time_raw;

          // re-calcs the total score
          diff[scene].score ? diff.totalScore = stored.totalScore - stored[scene].score + diff[scene].score : null;

          fireStore.collection("user_score").doc('/' + uid)
            .update(diff)
            .then(() => { res.send(JSON.stringify(stored[scene])) })
            .catch(err => {
              res.status(401).end();
              console.log(err);
            });
        } else {
          res.send(JSON.stringify(stored[scene]));
        }
      }
    });
  });

  return router;
}