const express = require("express");
const { getUsers } = require("../Controllers/userController");
const Router = express.Router();

Router.get("/", getUsers);

module.exports = Router;
