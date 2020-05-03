'use strict';
/* eslint-disable no-undef */

const express = require("express"),
  helmet = require("helmet"),
  admin = require("firebase-admin"),
  firebase = require("firebase"),
  requestIp = require('request-ip'),
  rateLimit = require("express-rate-limit"),
  cookieParser = require('cookie-parser'),
  { checkUrl } = require("./middleware/checkUrl"),
  { verifyToken } = require("./middleware/token"),
  // { firebaseConfig, firebaseService } = require("./firebase_config"), // comment on deploying
  app = express();


const fbConfig = {
  "apiKey": process.env.apiKey || firebaseConfig.apiKey,
  "authDomain": process.env.authDomain || firebaseConfig.authDomain,
  "databaseURL": process.env.databaseURL || firebaseConfig.databaseURL,
  "projectId": process.env.projectId || firebaseConfig.projectId,
  "storageBucket": process.env.storageBucket || firebaseConfig.storageBucket,
  "messagingSenderId": process.env.messagingSenderId || firebaseConfig.messagingSenderId,
  "appId": process.env.appId || firebaseConfig.appId,
  "measurementId": process.env.measurementId || firebaseConfig.measurementId
}

const fbService = {
  "type": process.env.type || firebaseService.type,
  "project_id": process.env.project_id || firebaseService.project_id,
  "private_key_id": process.env.private_key_id || firebaseService.private_key_id,
  "private_key": process.env.private_key ? process.env.private_key.replace(/\\n/g, '\n') : firebaseService.private_key,
  "client_email": process.env.client_email || firebaseService.client_email,
  "client_id": process.env.client_id || firebaseService.client_id,
  "auth_uri": process.env.auth_uri || firebaseService.auth_uri,
  "token_uri": process.env.token_uri || firebaseService.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url || firebaseService.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url || firebaseService.client_x509_cert_url
}

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(requestIp.mw());
app.set('trust proxy', true);
process.env.apiKey ? app.use(checkUrl) : null;

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10
});
const dataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5
})

firebase.initializeApp(fbConfig);
admin.initializeApp({ credential: admin.credential.cert(fbService), databaseURL: "https://fbauthdemo-2a451.firebaseio.com" });
const auth = firebase.auth();
const fireStore = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.NONE);

// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     let displayName = user.displayName,
//       email = user.email,
//       emailVerified = user.emailVerified,
//       photoURL = user.photoURL,
//       isAnonymous = user.isAnonymous,
//       uid = user.uid,
//       providerData = user.providerData;
//     console.log("\n----------------------- auth activity ----------------------------")
//     console.log(`uid: ${uid}, email: ${email}, displayName: ${displayName}, emailVerified: ${emailVerified}, photoURL ${photoURL}, isAnonymous ${isAnonymous}, \nproviderData: ${JSON.stringify(providerData)}\n`);
//   } else {
//     console.log("no user");
//   }
// });

module.exports = () => {

  const authRoute = require('./routes/auth_route')(auth, admin);
  app.use("/auth", authLimiter, authRoute);

  const dataRoute = require('./routes/data_route')(fireStore);
  app.use('/data', dataLimiter, verifyToken, dataRoute);

  return app;
};
