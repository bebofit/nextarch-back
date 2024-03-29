const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    imageurl: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/nextarch-bce1a.appspot.com/o/prof.png?alt=media&token=42254eca-ee3f-42d1-83e1-7e64eb3d3acb",
    },
    commentor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    desc: {
      type: String,
      default: "",
    },
    likes: {
      type: Number,
      default: 0,
    },
    likesarray: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdat: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment };
