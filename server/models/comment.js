const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

var CommentSchema = new Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
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
    imageurl: {
        type: String,
        required: true
    },
    subcomments: [{
        type: Schema.Types.ObjectId
    }]

});


var Comment = mongoose.model('Comment', CommentSchema)
module.exports = { Comment }