const express = require('express');
const app = express()
const PORT = 8888

app.use(express.static("assets"));

app.listen(PORT, console.log(`Server: http://localhost:${PORT}/`));