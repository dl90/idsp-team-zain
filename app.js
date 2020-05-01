'use strict';
/* eslint-disable no-undef */

const express = require("express"),
  helmet = require("helmet"),
  firebase = require("firebase"),
  requestIp = require('request-ip'),
  rateLimit = require("express-rate-limit"),
  // { firebaseConfig } = require("./firebase_config"), // comment when deploying
  app = express();

const fbConfig = {
  apiKey: process.env.apiKey || firebaseConfig.apiKey,
  authDomain: process.env.authDomain || firebaseConfig.authDomain,
  databaseURL: process.env.databaseURL || firebaseConfig.databaseURL,
  projectId: process.env.projectId || firebaseConfig.projectId,
  storageBucket: process.env.storageBucket || firebaseConfig.storageBucket,
  messagingSenderId: process.env.messagingSenderId || firebaseConfig.messagingSenderId,
  appId: process.env.appId || firebaseConfig.appId,
  measurementId: process.env.measurementId || firebaseConfig.measurementId
}

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(requestIp.mw());
app.set('trust proxy', true);

const reqLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5
});

firebase.initializeApp(fbConfig);
const auth = firebase.auth();
const fireStore = firebase.firestore();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    let displayName = user.displayName,
      email = user.email,
      emailVerified = user.emailVerified,
      photoURL = user.photoURL,
      isAnonymous = user.isAnonymous,
      uid = user.uid,
      providerData = user.providerData;
    console.log("\n----------------------- auth activity ----------------------------")
    console.log(`uid: ${uid}, email: ${email}, displayName: ${displayName}, emailVerified: ${emailVerified}, photoURL ${photoURL}, isAnonymous ${isAnonymous}, \nproviderData: ${JSON.stringify(providerData)}\n`);
  } else {
    console.log("no user");
  }
});

function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.') {
    const newHost = req.headers.host.slice(4);
    return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
  }
  next();
}

// app.use(wwwRedirect);

module.exports = () => {

  app.get("/test", (req, res, next) => {
    console.log(req.headers)
    console.log(req.headers.host, req.protocol, req.originalUrl)
    next();
  }, wwwRedirect, (req, res) => {
    console.log(req.headers)
    console.log(req.headers.host, req.protocol, req.originalUrl)
    console.log(req.headers['x-forwarded-proto'])
    res.send('OK')
  });

  const authRoute = require('./routes/auth_route')(auth);
  app.use("/auth", reqLimiter, authRoute);

  const dataRoute = require('./routes/data_route')(fireStore);
  app.use('/data', dataRoute);

  return app;
};
