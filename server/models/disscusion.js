const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

var DisscusionSchema = new Schema(
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
    privateDisc: {
      type: Schema.Types.ObjectId,
      ref: 'PrivateDisscusion',
      default: null
    },

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    userid: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastpost: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
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

var Disscusion = mongoose.model('Disscusion', DisscusionSchema);
module.exports = { Disscusion };
