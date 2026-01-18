require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet").default;
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./dbs/init.mongodb");

app.use("", require("./routes"));

module.exports = app;
