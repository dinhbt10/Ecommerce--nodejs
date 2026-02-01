"use strict";

const { BadRequestErrorResponse } = require("../core/error.response");
const {
  product,
  clothing,
  electronics,
  furniture,
} = require("./../models/product.model");

class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestErrorResponse(`Product type not found ${type}`);
    }
    return new productClass(payload).createProduct();
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_price,
    product_quantity,
    product_description,
    product_type,
    product_attributes,
    product_shop,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_description = product_description;
    this.product_type = product_type;
    this.product_attributes = product_attributes;
    this.product_shop = product_shop;
  }

  async createProduct(productId) {
    return await product.create({
      ...this,
      _id: productId,
    });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing)
      throw new BadRequestErrorResponse("Clothing create failed");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestErrorResponse("Product create failed");

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronics.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestErrorResponse("Electronics create failed");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestErrorResponse("Product create failed");

    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new BadRequestErrorResponse("Furniture create failed");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestErrorResponse("Product create failed");

    return newProduct;
  }
}

ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Eletronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
