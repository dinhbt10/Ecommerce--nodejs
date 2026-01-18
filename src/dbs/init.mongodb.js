"use strict";

const mongoose = require("mongoose");

const connectString =
  "mongodb+srv://miktendinh:miktendinh@dinhbt.6ihqz0n.mongodb.net/dinhbt";

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString)
      .then(() => console.log("Connected to MongoDB successfully"))
      .catch((err) => console.log("Error connecting to MongoDB", err));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceDatabase = Database.getInstance();
module.exports = instanceDatabase;
