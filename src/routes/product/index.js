"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asycHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//search product
router.get(
  "/search/:keySearch",
  asycHandler(productController.getListSearchProduct),
);

router.get("", asycHandler(productController.findAllProducts));
router.get("/:product_id", asycHandler(productController.findProduct));

//signup
router.use(authentication);

//create product
router.post("", asycHandler(productController.createProduct));
router.patch("/:productId", asycHandler(productController.updateProduct));
router.post(
  "/publish/:id",
  asycHandler(productController.publishProductByShop),
);

router.post(
  "/un-publish/:id",
  asycHandler(productController.unPublishProductByShop),
);

router.get("/drafts/all", asycHandler(productController.getAllDraftsForShop));
router.get(
  "/published/all",
  asycHandler(productController.getAllPublishedForShop),
);

module.exports = router;
