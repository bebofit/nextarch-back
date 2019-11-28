const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

var PrivateDisscusionSchema = new Schema(
  {
    title: {
      type: String
    },
    desc: {
      type: String,
      default: ''
    },
    category: {
      type: String
    },
    keywords: [
      {
        type: String
      }
    ],
    Disc: Schema.Types.ObjectId,
    comments: [
      {
        type: Schema.Types.ObjectId
      }
    ],
    userid: [
      {
        type: Schema.Types.ObjectId
      }
    ],
    lastpost: {
      type: Schema.Types.ObjectId
    },
    users: [
      {
        type: Schema.Types.ObjectId
      }
    ],
    imageurl: {
      type: String,
      default: ''
    },
    status: {
      type: Number
    },
    lastCommentUserName: {
      type: String
    }
  },
  { timestamps: true }
);

var PrivateDisscusion = mongoose.model(
  'PrivateDisscusion',
  PrivateDisscusionSchema
);
module.exports = { PrivateDisscusion };
