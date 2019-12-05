const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var CryptoJS = require('crypto-js');
const _ = require('lodash');

var notiSchema = new Schema(
  {
    type: {
      type: String,
      default: 'follow',
      enum: [
        'follow',
        'mention',
        'starDisc',
        'focusDiscStatus',
        'followCreateDisc'
      ]
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    otherUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

var Notification = mongoose.model('Notification', notiSchema);
module.exports = { Notification };
