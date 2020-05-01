function checkUrl(req, res, next) {
  const host = req.headers.host;
  const protocol = req.protocol;
  if (protocol !== "https" || req.headers['x-forwarded-proto'] !== 'https' || host.slice(0, 4) !== 'www.') {
    return res.redirect(301, "https://www." + host + req.url);
  } else {
    next();
  }
}

module.exports = { checkUrl }