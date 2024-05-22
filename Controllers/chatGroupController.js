const { ChatGroup } = require("../Models/ChatGroup");
const { Users } = require("../Models/users");

//@private method to all groups
//Token required
exports.getChatGroups = async (req, res) => {
  const allGrps = await ChatGroup.find();
  return res.json({ allGroups: allGrps });
};

//@private method to get user groups
//Token required
exports.getUserGroups = async (req, res) => {
  const userGrps = await ChatGroup.find({
    users: { $elemMatch: { user: req.userId } },
  }).populate({
    path: "users",
    populate: {
      path: "user",
    },
  });

  return res.status(201).json({ success: true, userGrps: userGrps });
};

//@private method to create group
//Token required
exports.createGrps = async (req, res) => {
  const userData = await Users.findOne({ userName: req.body.createdBy });
  const userId = userData._id;
  req.body.createdBy = userData._id;
  const adminUser = [{ user: userId, admin: true }];
  req.body.users = adminUser;
  const createdGrp = await ChatGroup.create(req.body);

  if (createdGrp) {
    return res.status(201).json({ createdGropup: createdGrp });
  } else {
    return res.send("No grp created");
  }
};

//@private method to add user
//Token required
exports.addUser = async (req, res) => {
  const newUser = await Users.findOne({ userName: req.body.user }).catch(
    (err) => {
      return res.send("User not found");
    }
  );
  if (!newUser) {
    return res.send("No user found");
  }

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
