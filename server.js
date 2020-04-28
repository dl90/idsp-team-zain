const express = require("express");
const helmet = require("helmet")
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.use(express.static("public"));
app.use(helmet());

app.listen(port, console.log(`Server: http://localhost:${port}/`));
