const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

var DisscusionSchema = new Schema({
    title: {
        type: String
    },
    desc: {
        type: String
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
    users: [{
        type: Schema.Types.ObjectId
    }],
    imageurl: {
        type: String
    }

});


var Disscusion = mongoose.model('Disscusion', DisscusionSchema)
module.exports = { Disscusion }