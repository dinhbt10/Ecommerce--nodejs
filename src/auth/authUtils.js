"use strict";

const JWT = require("jsonwebtoken");
const { asycHandler } = require("./checkAuth");
const {
  AuthFailureError,
  NotFoundErrorResponse,
} = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORRIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, privateKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, privateKey, (err, decode) => {
      if (err) {
        console.error("Error verifying access token:", err);
        return null;
      }
      console.log("Decoded access token:", decode);
    });
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const authentication = asycHandler(async (req, res, next) => {
  /**
   *  1. Check userId missing???
   *  2. Check accessToken missing???
   *  3. verifyToken
   *  4. Check user in db
   *  5. Check keyStore with this userId
   *  6. Ok all => return next()
   */

  const userId = req.headers[HEADER.CLIENT_ID];

  if (!userId) throw new AuthFailureError("Invalid Request");

  const keyStore = await KeyTokenService.findByUserId(userId);

  if (!keyStore) throw new NotFoundErrorResponse("No keyStore found");

  const accessToken = req.headers[HEADER.AUTHORRIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    if (decodeUser.userId !== userId)
      throw new AuthFailureError("Invalid Request");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
