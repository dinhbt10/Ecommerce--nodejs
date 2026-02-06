"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model");

const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProducts({
    query,
    limit,
    skip,
  });
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
  return await queryProducts({
    query,
    limit,
    skip,
  });
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const result = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      {
        score: { $meta: "textScore" },
      },
    )
    .sort({ score: { $meta: "textScore" } })
    .lean()
    .exec();

  return result;
};

const publishProductByShop = async ({ product_id, product_shop }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundProduct) {
    throw new BadRequestErrorResponse("Product not found");
  }
  foundProduct.isDraft = false;
  foundProduct.isPublished = true;
  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  return modifiedCount;
};

const unPublishProductByShop = async ({ product_id, product_shop }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundProduct) {
    throw new BadRequestErrorResponse("Product not found");
  }
  foundProduct.isDraft = true;
  foundProduct.isPublished = false;
  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  return modifiedCount;
};

const queryProducts = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductByUser,
};
