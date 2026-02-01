"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestErrorResponse,
  ForbiddenErrorResponse,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const roles = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static handlerRefreshToken = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.removeKeyById(keyStore._id);
      throw new ForbiddenErrorResponse(
        "Something went wrong!! Pls login again",
      );
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new ForbiddenErrorResponse(
        "Something went wrong!! Pls login again",
      );
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Something went wrong!! Pls login again");
    }

    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

  static logout = async (keyStore) => {
    return await KeyTokenService.removeKeyById(keyStore._id);
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestErrorResponse("Shop not registered");
    }

    const matchPassword = await bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new BadRequestErrorResponse("Authentication failed");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey,
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      userId: foundShop._id,
      publicKey,
      privateKey,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        throw new BadRequestErrorResponse("Email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: hashedPassword,
        roles: [roles.SHOP],
      });

      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          throw new BadRequestErrorResponse("Error creating key token");
        }

        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey,
        );
        return {
          code: 201,
          meta: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = AccessService;
