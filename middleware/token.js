const admin = require("firebase-admin");

function verifyToken(req, res, next) {
  if (req.cookies.idToken) {
    admin.auth().verifyIdToken(req.cookies.idToken)
      .then(decodedToken => {
        res.locals.decodedToken = decodedToken;
        next();
      }).catch((err) => {
        console.log(err.message);
        res.status(403).end();
      });
  } else {
    res.status(403).end();
  }
}

module.exports = { verifyToken }