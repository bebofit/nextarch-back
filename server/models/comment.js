const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

var CommentSchema = new Schema({
    imageurl: {
        type: String,
        required: true
    },
    subcomments: [{
        type: Schema.Types.ObjectId
    }],
    commentor: {
        type: Schema.Types.ObjectId
    },
    desc: {
        type: String
    },
    likes: {
        type:Number,
        default: 0
    }
});


var Comment = mongoose.model('Comment', CommentSchema)
module.exports = { Comment }