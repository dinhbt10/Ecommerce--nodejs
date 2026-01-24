"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asycHandler } = require("../../auth/checkAuth");
const router = express.Router();

//signup
router.post("/shop/signup", asycHandler(accessController.signUp));

module.exports = router;
