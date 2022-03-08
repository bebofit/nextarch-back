const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var DisscusionSchema = new Schema(
  {
    _id: {
      type: ObjectID,
    },
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
    privateDisc: {
      type: Schema.Types.ObjectId,
      ref: "PrivateDisscusion",
      default: null,
    },

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

var Disscusion = mongoose.model("Disscusion", DisscusionSchema);
module.exports = { Disscusion };
