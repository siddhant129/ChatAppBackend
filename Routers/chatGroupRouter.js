const express = require("express");
const {
  createGrps,
  getChatGroups,
  addUser,
} = require("../Controllers/chatGroupController");
const router = express.Router();

router
  .get("/getGrps", getChatGroups)

  .post("/createGrp", createGrps)

  .post("/addUser", addUser);

module.exports = router;
