const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var PrivateDisscusionSchema = new Schema(
  {
    title: {
      type: String,
    },
    desc: {
      type: String,
      default: "",
    },
    category: {
      type: String,
    },
    keywords: [
      {
        type: String,
      },
    ],
    Disc: Schema.Types.ObjectId,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    userid: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastpost: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    imageurl: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
    },
    lastCommentUserName: {
      type: String,
    },
  },
  { timestamps: true }
);

var PrivateDisscusion = mongoose.model(
  "PrivateDisscusion",
  PrivateDisscusionSchema
);
module.exports = { PrivateDisscusion };
