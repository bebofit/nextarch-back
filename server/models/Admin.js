const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var CryptoJS = require('crypto-js');
const _ = require('lodash');

var adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: '{value} is not an email'
      }
    },
    password: {
      type: String,
      minlength: 6
    },
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

adminSchema.statics.findByToken = function(token) {
  let Admin = this;
  var decoded;
  try {
    decoded = jwt.verify(token, 'nourhany');
  } catch (error) {
    return Promise.reject();
  }
  return Admin.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'admin'
  });
};

var Admin = mongoose.model('Admin', adminSchema);
module.exports = { Admin };
