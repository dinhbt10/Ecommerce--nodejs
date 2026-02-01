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
  /**
   * 1 - Kiểm tra email trong cơ sở dữ liệu
   * 2 - So sánh mật khẩu
   * 3 - Tạo access token và refresh token
   * 4 - Tạo key token và lưu vào cơ sở dữ liệu
   * 5 - Trả access token và refresh token cho client
   */
  static login = async ({ email, password, refreshToken = null }) => {
    //1
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestErrorResponse("Shop not registered");
    }

    //2
    const matchPassword = await bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new BadRequestErrorResponse("Authentication failed");
    }

    //3
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //4
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

  // Đăng ký tài khoản Shop
  // Bước 1: Kiểm tra email đã tồn tại trong hệ thống
  // Bước 2: Hash mật khẩu bằng bcrypt để bảo vệ dữ liệu
  // Bước 3: Tạo bản ghi Shop mới với vai trò mặc định 'SHOP'
  // Bước 4: Sinh cặp khóa (privateKey/publicKey) và lưu vào KeyToken để quản lý xác thực
  // Bước 5: Tạo cặp JWT (accessToken/refreshToken) cho phiên đăng nhập đầu tiên
  // Bước 6: Chuẩn hóa dữ liệu trả về (chỉ _id, name, email) kèm tokens
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
