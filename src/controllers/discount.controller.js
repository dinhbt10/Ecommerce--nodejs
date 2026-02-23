"use strict";

const { succesResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  async createDiscountCode(req, res, next) {
    new succesResponse({
      message: "Create discount code success",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  }

  async getAllDiscountCodesWithProduct(req, res, next) {
    new succesResponse({
      message: "Get all discount code with product success",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  }

  async getAllDiscountCodesByShop(req, res, next) {
    new succesResponse({
      message: "Get all discount code by shop success",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  }

  async getDiscountAmount(req, res, next) {
    new succesResponse({
      message: "Get discount amount success",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  }
}

module.exports = new DiscountController();
