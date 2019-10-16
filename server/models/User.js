const {mongoose} = require('../db/mongoose');
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _= require('lodash')

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim : true,
        unique : true,
        validate: {
            validator:validator.isEmail,
            message: '{value} is not an email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
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

});

UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject,['_id','email']);
}

UserSchema.methods.generateAuthToken = function (){
    let user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'nourhany')
    user.tokens= user.tokens.concat([{
        access,
        token
    }])
    return user.save().then(()=>{
        return token;
    })
};

UserSchema.statics.findByCred = function (email,password) {
    var User = this;
   return User.findOne({email}).then((user)=>{
       if(!user)
       {
           return Promise.reject()
       }

       return new Promise((resolve,reject)=>{
           bcrypt.compare(password,user.password,(err, flag)=>{
               if(!flag)
               {
                   return Promise.reject()
               }
               else
               {
                   resolve(user)
               }
           })
       })
   })
}
UserSchema.statics.findByToken = function (token) {
    let User = this;
    var decoded
    try {
       decoded= jwt.verify( token ,'nourhany'   )
    } catch (error) {
        return Promise.reject()
    } 
    return User.findOne({
        "_id": decoded._id,
        'tokens.token': token,
        'tokens.access': "auth"
    })
}

UserSchema.methods.removeToken = function (token){
    var user =this;
   return user.update({
        $pull:{
            tokens: {
                token: token
            }
        }
    })
}

UserSchema.pre('save', function (next) {
    var user = this;

   if( user.isModified('password'))
   {
    let password = user.password;
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password, salt, (err, hash)=>{
            user.password = hash;
            next();
        })
    })

   }
   else{ next()}
})
var User = mongoose.model('User',UserSchema)
module.exports ={User}