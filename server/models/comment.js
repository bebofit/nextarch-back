const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

var CommentSchema = new Schema({
    imageurl: {
        type: String,
        default: ''
    },
    subcomments: [{
        type: Schema.Types.ObjectId
    }],
    commentor: [{
        type: Schema.Types.ObjectId
    }],
    desc: {
        type: String,
        default: ''
    },
    likes: {
        type:Number,
        default: 0
    },
    createdat:{
        type: String

    }
});


var Comment = mongoose.model('Comment', CommentSchema)
module.exports = { Comment }