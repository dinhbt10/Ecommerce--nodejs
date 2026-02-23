"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asycHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.post("/amount", asycHandler(discountController.getDiscountAmount));
router.get(
  "/list_product_code",
  asycHandler(discountController.getAllDiscountCodesWithProduct),
);

router.use(authentication);

router.post("", asycHandler(discountController.createDiscountCode));
router.get("", asycHandler(discountController.getAllDiscountCodesByShop));

module.exports = router;
