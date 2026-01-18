"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const roles = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      
      if (holderShop) {
        return {
          code: 'xxxxx',
          message: 'Email already exists',
        };
      }
      //Hash password before storing it in the database to enhance security
      const hashedPassword = await bcrypt.hash(password, 10);
      // step1: check email exists??
      const newShop = await shopModel.create({
        name,
        email,
        password: hashedPassword,
        roles: [roles.SHOP],
      });

      if (newShop) {
        // Tạo các khóa bí mật và công khai với thuật toán RSA
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        });

        if (!keyStore) {
          return {
            code: 'xxxx',
            message: 'Error creating key token',
          };
        }

        // create token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
        return {
          code: 201,  
          meta: {
            shop: getInfoData({
              fields: ['_id', 'name', 'email'],
              object: newShop,
            }),
            tokens,
          }
        };
      }
      return {
        code: 200,
        metadata: null
      };

    } catch (error) {
      throw error;
    }
  };
}

module.exports = AccessService;
