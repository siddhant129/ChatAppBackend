const express = require("express");
const {
  createGrps,
  getChatGroups,
  addUser,
  getUserGroups,
} = require("../Controllers/chatGroupController");
const router = express.Router();

router
  .get("/getGrps", getChatGroups)

  .post("/createGrp", createGrps)

  .get("/getUserGrps", getUserGroups)

  .post("/addUser", addUser);

module.exports = router;
