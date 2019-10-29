const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')
const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')
var CryptoJS = require("crypto-js");
const _ = require('lodash')

var UserSchema = new Schema({
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
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    dateofbirth: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    foi: [{
        type: String
    }],
    bio: {
        type: String
    },
    softwares: [{
        type: String
    }],
    company:{
        type: String
    },
    portfolio:{
        type: String
    },
    website:{
        type: String
    },
    createdat:{
        type: String
    },
    favdisc: [{
        type: Schema.Types.ObjectId
    }],

    favproj: [{
        type: Schema.Types.ObjectId
    }],
    followers: [{
        type: Schema.Types.ObjectId

    }],
    following: [{
        type: Schema.Types.ObjectId

    }],
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    imageurl: {
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/nextarch-bce1a.appspot.com/o/prof.png?alt=media&token=42254eca-ee3f-42d1-83e1-7e64eb3d3acb'
    },
    status: {
        type: Number,
        default: 0;
    }
}, {timestamps: true});

// UserSchema.methods.toJSON = function () {
//     let user = this;
//     let userObject = user.toObject();

//     return _.pick(userObject, ['_id', 'email']);
// }

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'nourhany')
    user.tokens = user.tokens.concat([{
        access,
        token
    }])
    return user.save().then(() => {
        return token;
    })
};

UserSchema.statics.findByCred = function (email, password) {
    var User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('no user exist')
        }

        return new Promise((resolve, reject) => {

            let bytes = CryptoJS.AES.decrypt(user.password.toString(), 'cabonourhanysisa1997');
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);

                if (plaintext != password) {
                    return Promise.reject('wrong password')
                }
                else {
                    resolve(user)
                }
        })
    })
}
UserSchema.statics.findByToken = function (token) {
    let User = this;
    var decoded
    try {
        decoded = jwt.verify(token, 'nourhany')
    } catch (error) {
        return Promise.reject()
    }
    return User.findOne({
        "_id": decoded._id,
        'tokens.token': token,
        'tokens.access': "auth"
    })
}

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    })
}

var User = mongoose.model('User', UserSchema)
module.exports = { User }