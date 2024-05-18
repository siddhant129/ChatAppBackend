const mongoose = require("mongoose");
const { Users } = require("./users");

const chatGroupSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  users: [
    {
      user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users",
        unique: true,
      },
      admin: {
        type: Boolean,
        default: false,
        unique: true,
      },
    },
  ],
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// chatGroupSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

// chatGroupSchema.set("toJSON", {
//   virtuals: true,
// });

exports.ChatGroup = mongoose.model("chatGroup", chatGroupSchema);
