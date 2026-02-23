const { BadRequestErrorResponse } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodeUnSelect,
  checkDiscountExist,
  findAllDiscountCodeSelect,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectId } = require("../utils");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_uses,
      used_count,
      users_used,
      max_uses_per_user,
      min_order_value,
      shopId,
      is_active,
      applies_to,
      product_ids,
    } = payload;

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestErrorResponse(
        "Discount start date must be before end date",
      );
    }

    const foundDiscountCode = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (foundDiscountCode) {
      throw new BadRequestErrorResponse("Discount code already exists");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: start_date,
      discount_end_date: end_date,
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: convertToObjectId(shopId),
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscountCodes = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscountCodes || foundDiscountCodes.length === 0) {
      throw new BadRequestErrorResponse("Discount code not found");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscountCodes;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page, select }) {
    const discounts = await findAllDiscountCodeSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      select: [
        "discount_code",
        "discount_name",
        "discount_type",
        "discount_value",
      ],
      model: discountModel,
    });

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExist({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount)
      throw new BadRequestErrorResponse("Discount code not found");

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
      discount_users_used,
    } = foundDiscount;

    if (!discount_is_active)
      throw new BadRequestErrorResponse("Discount code is not active");

    if (discount_max_uses <= 0) {
      throw new BadRequestErrorResponse("Discount code has reached max uses");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestErrorResponse("Discount code is not active");
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce(
        (acc, cur) => acc + cur.price * cur.quantity,
        0,
      );

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestErrorResponse(
          `Discount code min order value is ${discount_min_order_value}`,
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find(
        (item) => item.userId === userId,
      );
      if (userUseDiscount) {
        throw new BadRequestErrorResponse("Discount code has been used");
      }
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscount({ codeId, shopId }) {
    return await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExist({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount)
      throw new BadRequestErrorResponse("Discount code not found");

    const result = await discountModel.findOneAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_used_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
