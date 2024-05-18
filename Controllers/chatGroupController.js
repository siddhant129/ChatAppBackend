const { json } = require("express");
const { ChatGroup } = require("../Models/ChatGroup");
const { Users } = require("../Models/users");

exports.getChatGroups = async (req, res) => {
  const allGrps = await ChatGroup.find();
  return res.json({ allGroups: allGrps });
};

exports.createGrps = async (req, res) => {
  const userData = await Users.findOne({ userName: req.body.createdBy });
  const userId = userData._id;
  req.body.createdBy = userData._id;
  const adminUser = [{ user: userId, admin: true }];
  req.body.users = adminUser;
  const createdGrp = await (await ChatGroup.create(req.body)).populate("users");

  if (createdGrp) {
    return res.json({ createdGropup: createdGrp });
  } else {
    return res.send("No grp created");
  }
};

//@private method to add user
//Token required
exports.addUser = async (req, res) => {
  const newUser = await Users.findOne({ userName: req.body.user });
  var flag = false;
  const newUser1 = { user: newUser._id, admin: false };
  const aldExist = await ChatGroup.findOne({ Name: req.body.Name })
    .populate({
      path: "users",
      populate: {
        path: "user",
      },
    })
    .then((grp) => {
      const allUsers = grp.users;
      allUsers.map((user) => {
        if (user.user) {
          if (user.user._id.equals(newUser._id)) {
            flag = true;
          }
        }
      });
    });
  if (flag) {
    return res.send("User already exists");
  }
  const chatGrp = await ChatGroup.findOneAndUpdate(
    { Name: req.body.Name },
    {
      $push: {
        users: newUser1,
      },
    },
    {
      new: true,
    }
  ).populate({
    path: "users",
    populate: {
      path: "user",
    },
  });

  if (chatGrp) {
    return res.json({ createdGropup: chatGrp });
  } else {
    return res.send("No grp found");
  }
};
