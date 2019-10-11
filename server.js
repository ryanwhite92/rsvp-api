"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.use("/static", express.static("public"));

app.get("/", (req, res) => res.sendFile(`${__dirname}/views/index.html`));

app.listen(port, () => console.log(`Listening on port ${port}`));
