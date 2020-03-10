const express = require('express');
const app = express()

app.use( express.static("assets"));
app.get('/', (req, res) => {
  res.send('home');
})

app.listen(8888);