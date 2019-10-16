
const {User} = require('../models/User');
const {authenticate} = require('../middleware/authenticate')

var express = require('express');
var bodyParser = require('body-parser');
const _= require('lodash')

var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/signup',(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    var user = new User(body);

    user.save().then(()=>{
      return  user.generateAuthToken();
    }).then((token)=>{
       res.header('x-auth', token).send(user)
    })
    .catch((err)=>{
        res.status(400).send(err)
    })
})


router.post('/getuser',authenticate, (req,res)=>{
   res.send(req.user);
})

router.post('/login',async(req,res)=>{
  try {
   const body = _.pick(req.body, ['email','password'])
   console.log(body);
   const user = await User.findByCred(body.email,body.password)
   const token = await user.generateAuthToken()
   res.header('x-auth', token).send(user)
  } catch (error) {
   res.status(400).send();
  }
})


router.delete('/me/token',authenticate,async(req,res)=>{
   try {
       await req.user.removeToken(req.token);
       res.status(200).send({msg: "Removed Token!"})
   } catch (error) {
       res.status(400).send()
   }
})

module.exports = router;