const { User } = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
var CryptoJS = require('crypto-js');

var express = require('express');
var bodyParser = require('body-parser');
const _ = require('lodash');

var router = express.Router();
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);
router.use(bodyParser.json());

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

router.post('/signup', (req, res) => {
  // var body = _.pick(req.body);
  let createdat = new Date();
  var ciphertext = CryptoJS.AES.encrypt(
    req.body.password,
    'cabonourhanysisa1997'
  );
  // let s = monthNames[d.getMonth()] + ' ' + d.get400() + ', ' + d.getFullYear()
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    name: req.body.name,
    dateofbirth: req.body.dateofbirth,
    gender: req.body.gender,
    city: req.body.city,
    desc: req.body.desc,
    foi: req.body.foi,
    bio: req.body.bio,
    softwares: req.body.softwares,
    company: req.body.company,
    portfolio: req.body.portfolio,
    website: req.body.website,
    password: ciphertext,
    createdat
  });
  let result = _.pick(user, [
    '_id',
    'username',
    'email',
    'name',
    'dateofbirth',
    'gender',
    'city',
    'desc',
    'foi',
    'bio',
    'softwares',
    'company',
    'portfolio',
    'website',
    'createdat',
    'favdisc',
    'following',
    'followers'
  ]);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.send({
        user: result,
        token: token
      });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post('/getuser', authenticate, async (req, res) => {
  let user2 = await User.findOne({ _id: req.body.id });

  let result = _.pick(user2, [
    '_id',
    'username',
    'email',
    'name',
    'dateofbirth',
    'gender',
    'city',
    'desc',
    'foi',
    'bio',
    'softwares',
    'company',
    'portfolio',
    'website',
    'createdat',
    'favdisc',
    'following',
    'followers'
  ]);

  res.send(result);
});

router.post('/getOtherUser', authenticate, async (req, res) => {
  let user = await User.findOne({ _id: req.body.userId });
  let otherUser = await User.findOne({ _id: req.body.otherUserId });
  for (let i = 0; i < user.following.length; i++) {
    if (user.following[i] == req.body.otherUserId) {
      otherUser.status = 1;
      break;
    }
  }
  let result = _.pick(otherUser, [
    '_id',
    'username',
    'email',
    'name',
    'dateofbirth',
    'gender',
    'city',
    'desc',
    'foi',
    'bio',
    'softwares',
    'company',
    'portfolio',
    'website',
    'createdat',
    'favdisc',
    'status',
    'following',
    'followers'
  ]);

  res.send(result);
});

router.post('/login', async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).send({ msg: 'No user exsist!' });
  }
  let bytes = CryptoJS.AES.decrypt(
    user.password.toString(),
    'cabonourhanysisa1997'
  );
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (plaintext != password) {
    return res.status(400).send({ msg: 'Invalid Password' });
  } else {
    const token = await user.generateAuthToken();
    let result = _.pick(user, [
      '_id',
      'username',
      'email',
      'name',
      'dateofbirth',
      'gender',
      'city',
      'desc',
      'foi',
      'bio',
      'softwares',
      'company',
      'portfolio',
      'website',
      'createdat',
      'favdisc',
      'following',
      'followers'
    ]);

    return res.send({
      user: result,
      token: token
    });
  }
});

router.delete('/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send({
      msg: 'Removed Token!'
    });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/img', authenticate, async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.body.id },
      { imageurl: req.body.imgurl }
    );
    res.send({ msg: 'done' });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/changePassword', authenticate, async (req, res) => {
  userID = req.body.userid;
  old = req.body.old;
  newPassword = req.body.newPassword;

  let user;
  user = await Account.findOne({
    _id: userID
  }).exec();
  if (!user) {
    return res.status(400).send({
      msg: 'Invalid credentials'
    });
  }

  let bytes = CryptoJS.AES.decrypt(
    user.password.toString(),
    'cabonourhanysisa1997'
  );
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (plaintext != old) {
    return res.status(400).send({
      msg: 'Invalid Password'
    });
  }
  var ciphertext = CryptoJS.AES.encrypt(newPassword, 'cabonourhanysisa1997');

  user.password = ciphertext;
  const resu = await user.save();
  let result = _.pick(resu, [
    '_id',
    'username',
    'email',
    'name',
    'dateofbirth',
    'gender',
    'city',
    'desc',
    'foi',
    'bio',
    'softwares',
    'company',
    'portfolio',
    'website',
    'createdat',
    'favdisc',
    'following',
    'followers'
  ]);
  return res.status(200).send({
    ...result._doc
  });
});

router.post('/follow', authenticate, async (req, res) => {
  try {
    const f1 = await User.findByIdAndUpdate(
      {
        _id: req.body.userid
      },
      {
        $push: {
          following: req.body.otherid
        }
      }
    );

    const f2 = await User.findByIdAndUpdate(
      {
        _id: req.body.otherid
      },
      {
        $push: {
          followers: req.body.userid
        }
      }
    );
    res.status(200).send({
      msg: 'followed'
    });
  } catch (error) {
    res.status(400).send({
      msg: 'error ya sisa'
    });
  }
});

router.post('/unfollow', authenticate, async (req, res) => {
  try {
    const f1 = await User.findByIdAndUpdate(
      {
        _id: req.body.userid
      },
      {
        $pull: {
          following: req.body.otherid
        }
      }
    );

    const f2 = await User.findByIdAndUpdate(
      {
        _id: req.body.otherid
      },
      {
        $pull: {
          followers: req.body.userid
        }
      }
    );
    res.status(200).send({
      msg: 'unfollowed'
    });
  } catch (error) {
    res.status(400).send({
      msg: 'error ya sisa'
    });
  }
});

module.exports = router;
