"use strict";

const { asycHandler } = require("./checkAuth");
const JWT = require("jsonwebtoken");
const {
  AuthFailureError,
  NotFoundErrorResponse,
} = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORRIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken-id",
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
    });
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const authentication = asycHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundErrorResponse("No keyStore found");

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
    const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
    if (decodeUser.userId !== userId)
      throw new AuthFailureError("Invalid Request");
    req.keyStore = keyStore;
    req.user = decodeUser;
    req.refreshToken = refreshToken;
    return next();
  }

  const accessToken = req.headers[HEADER.AUTHORRIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
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
