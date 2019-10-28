const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

var DisscusionSchema = new Schema({
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
    keywords: [{
        type: String
    }],
   comments: [{
    type: Schema.Types.ObjectId
   }],
   userid:[{
    type: Schema.Types.ObjectId
   }],
   lastpost:{
    type: Schema.Types.ObjectId
   },
    users: [{
        type: Schema.Types.ObjectId,
        unique: true

    }],
    imageurl: {
        type: String,
        default: ''
    },
    status:{
        type: Number
    },
    lastCommentUserName:{
        type: String
    }

} ,{timestamps: true});


var Disscusion = mongoose.model('Disscusion', DisscusionSchema)
module.exports = { Disscusion }