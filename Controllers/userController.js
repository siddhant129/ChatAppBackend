const { Users } = require("../Models/users");

exports.getUsers = async (req, res) => {
  const allUsers = await Users.find();
  if (allUsers) {
    return res.json({ users: allUsers });
  }
};
