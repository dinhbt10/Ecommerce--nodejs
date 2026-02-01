"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // // level 0
      // const tokens = await keytokenModel.create({
      //     user: userId,
      //     publicKey,
      //     privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      // level xxx
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };

      const tokens = await keytokenModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) });
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(new Types.ObjectId(id));
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };
}

module.exports = KeyTokenService;
