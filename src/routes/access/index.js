"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asycHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//signup
router.post("/shop/signup", asycHandler(accessController.signUp));

//login
router.post("/shop/login", asycHandler(accessController.login));

router.use(authentication);
//logout
router.post("/shop/logout", asycHandler(accessController.logout));

module.exports = router;
