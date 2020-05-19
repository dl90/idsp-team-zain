'use strict';
/* eslint-disable no-unused-vars */

const express = require("express"),
  router = express.Router(),
  firebase = require("firebase");

module.exports = function (fireStore) {


  router.get('/level-data', (req, res) => {
    if (res.locals.decodedToken) {
      try {
        fireStore.collection("user_score").doc('/' + res.locals.decodedToken.uid).get()
          .then(doc => { res.send(JSON.stringify(doc.data())) })
          .catch(error => { console.log(error) });
      } catch (error) {
        res.status(401).end();
        console.log(error);
      }
    } else {
      res.status(401).end();
    }
  })


  router.post('/leader-board', async (req, res) => {
    const { scene } = req.body,
      [topTen_total, topTen_level] = [[], []];

    try {
      await fireStore.collection('user_score').orderBy("totalScore", "desc").limit(10).get()
        .then(snapshot => { snapshot.forEach(doc => { topTen_total.push({ displayName: doc.data().displayName, score: doc.data().totalScore }) }) })
        .catch(err => console.log(err));

      await fireStore.collection('user_score').where(`${scene}.score`, '>', 0).orderBy(`${scene}.score`, "desc").limit(10).get()
        .then(snapshot => { snapshot.forEach(doc => { topTen_level.push({ displayName: doc.data().displayName, score: doc.data()[scene].score }) }) })
        .catch(err => console.log(err));

      res.send(JSON.stringify({ topTen_total, topTen_level }));
    } catch (error) { console.log(error) }
  });


  router.post('/score', (req, res) => {
    const { uid, displayName, scene, score, time_raw, health, bonus_score } = req.body;
    if (uid) {
      uid.trim().length < 28 ? (() => { return res.status(401) })() : null;

      fireStore.collection("user_score").doc('/' + uid).get().then(doc => {
        const stored = doc.data(); // existing data

        if (!doc.exists) { // document doesn't exist
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
            .catch(err => { console.log(err) });

        } else if (stored[scene] === undefined) { // document exists but scene doesn't exist
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
            .catch(err => { console.log(err) });

        } else { // document and scene exists
          const diff = { [scene]: { 'timestamp': firebase.firestore.FieldValue.serverTimestamp() } };
          if (stored[scene].score < score) {
            diff[scene].score = score;
            diff[scene].bonus_score = bonus_score;
            diff[scene].health = health;
            diff[scene].time_raw = time_raw;

            // re-calcs the total score
            diff.totalScore = stored.totalScore - stored[scene].score + diff[scene].score;

            fireStore.collection("user_score").doc('/' + uid)
              .update(diff)
              .then(() => { res.send(JSON.stringify(stored[scene])) })
              .catch(err => { console.log(err) });

          } else {
            res.send(JSON.stringify(stored[scene]));
          }
        }
      });
    } else {
      res.status(401).end();
    }
  });

  return router;
}