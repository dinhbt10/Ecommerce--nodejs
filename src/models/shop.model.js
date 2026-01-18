"use strict";

const mongoose = require("mongoose");

const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "shops";

const shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verfify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Schema.Types.Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, shopSchema);
