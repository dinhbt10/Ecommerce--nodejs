"use strict";

const { CreatedResponse, succesResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new succesResponse({
      message: "Get Token Success",
      metadata: await AccessService.handlerRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new succesResponse({
      message: "Logout Success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new succesResponse({
      message: "Login Success",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new CreatedResponse({
      message: "Sign Up Success",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
