'use strict';

const app = require("./app")();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8888;
}

app.listen(port, console.log(`Server: http://localhost:${port}/`));