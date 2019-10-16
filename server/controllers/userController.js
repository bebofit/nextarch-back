
const {User} = require('../models/User');
const {authenticate} = require('../middleware/authenticate')

var express = require('express');
var bodyParser = require('body-parser');
const _= require('lodash')

var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

router.post('/signup',(req,res)=>{

   var body = _.pick(req.body);
   let createdat = new Date();
   // let s = monthNames[d.getMonth()] + ' ' + d.get400() + ', ' + d.getFullYear()
    var user = new User({ body, createdat});

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


router.post('/changePassword',authenticate, async (req, res) => {

    userID = req.body.userid
     old = req.body.old
     newPassword = req.body.newPassword
 
     let user;
     user = await Account.findOne({ _id: userID }).exec();
     if (!user) {
       return res.status(400).send({ msg: 'Invalid credentials' });
     }
 
   let bytes = CryptoJS.AES.decrypt(user.password.toString(), 'cabonourhanysisa1997');
   var plaintext = bytes.toString(CryptoJS.enc.Utf8);
   
     if (plaintext != old) {
       return res.status(400).send({ msg: 'Invalid Password' });
 
     }
     var ciphertext = CryptoJS.AES.encrypt(newPassword, 'cabonourhanysisa1997');
 
     user.password = ciphertext;
     const resu = await user.save();
     let result = _.pick(resu, ['email', 'name', 'dateofbirth', 'gender', 'city', 'desc', 'foi', 'bio', 'softwares', 'company', 'portfolio', 'website', 'createdat']);
     return res.status(200).send({ ...result._doc });
 })

module.exports = router;