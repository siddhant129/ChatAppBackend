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
  const createdGrp = await ChatGroup.create(req.body);

  if (createdGrp) {
    return res.json({ createdGropup: createdGrp });
  } else {
    return res.send("No grp created");
  }
};

exports.addUser = async (req, res) => {
  const newUser = await Users.find({ userName: req.body.user });
  console.log(newUser);
  //   const newUser = [{ user: req.body.user }];
  //   req.body.users = newUser;
  const chatGrp = await ChatGroup.findOneAndUpdate(
    { Name: req.body.Name },
    {
      $push: { users: newUser.id },
    },
    {
      new: true,
    }
  );
  console.log(chatGrp);
  //   chatGrp.users.push();

  if (chatGrp) {
    return res.json({ createdGropup: chatGrp });
  } else {
    return res.send("No grp found");
  }
};
