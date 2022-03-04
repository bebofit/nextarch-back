const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var CryptoJS = require('crypto-js');
const _ = require('lodash');

var formSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    finalquestion: {
      type: String,
      required: true
    },
    outputs: {
      type: String,
      required: true
    },
    stakeholders: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challenges: {
      type: String,
      required: true
    },
    constitution: {
      type: String,
      required: true
    },
    discId: { type: Schema.Types.ObjectId, ref: 'Disscusion', required: true }
  },
  { timestamps: true }
);

formSchema.statics.findByToken = function(token) {
  let Form = this;
  var decoded;
  try {
    decoded = jwt.verify(token, 'nourhany');
  } catch (error) {
    return Promise.reject();
  }
  return Form.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'form'
  });
};

var Form = mongoose.model('Form', formSchema);
module.exports = { Form };
