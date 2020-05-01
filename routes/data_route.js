'use strict';
/* eslint-disable no-unused-vars */

const express = require("express"),
  router = express.Router()

module.exports = function (fireStore) {

  router.get('/score', (req, res) => {
    // let doc = fireStore.collection('user_score').doc('/' +  req.uid)
  })

  router.get('/high_score', (req, res) => {
    fireStore.collection('high_score').onSnapshot()
  })

  router.post('/score', (req, res) => {
    const { uid, scene_1_score, scene_1_time, scene_1_health } = req.body;
    res.send(JSON.stringify({msg:'ok'}))
    // fireStore.collections("user_score").doc('/' +  req.uid)
    // .add({

    //   timestamp: fireStore.FieldValue.serverTimestamp()
    // })
  })

  return router
}