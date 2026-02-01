"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asycHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//signup
router.use(authentication);

//create product
router.post("", asycHandler(productController.createProduct));

module.exports = router;
