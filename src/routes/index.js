"use strict";

const express = require("express");
const router = express.Router();
const { apiKey, permissions } = require("../auth/checkAuth");

// check api key
router.use(apiKey);
// check permissions
router.use(permissions('0000'));

router.use("/v1/api", require("./access"));

module.exports = router;
