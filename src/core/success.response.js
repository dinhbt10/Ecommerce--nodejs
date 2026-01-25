"use strict";

const StatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
};

const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created",
  NO_CONTENT: "No Content",
};

class succesResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = message || reasonStatusCode;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OkResponse extends succesResponse {
  constructor({ message, metadata = {} }) {
    super({
      message,
      metadata,
    });
  }
}

class CreatedResponse extends succesResponse {
  constructor({
    options = {},
    message,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata = {},
  }) {
    super({
      message,
      statusCode,
      reasonStatusCode,
      metadata,
    });
    this.options = options;
  }
}

export { OkResponse, CreatedResponse, succesResponse };
