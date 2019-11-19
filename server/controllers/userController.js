const { User } = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
const { Disscusion } = require('../models/disscusion');
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
  let createdAt = new Date();
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
    securityQuestion: req.body.securityQuestion,
    securityQuestionAnswer: req.body.securityQuestionAnswer,
    password: ciphertext,
    createdAt
  });
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      const userObject = user.toJSON();
      delete userObject.password;
      delete userObject.tokens;
      delete userObject.securityQuestion;
      delete userObject.securityQuestionAnswer;
      res.send({
        user,
        token: token
      });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post('/getuser', authenticate, async (req, res) => {
  var user = await User.findOne({ _id: req.body.id }).select(
    '-password -tokens -securityQuestion -securityQuestionAnswer'
  );
  res.send(user);
});

router.post('/getOtherUser', authenticate, async (req, res) => {
  let user = await User.findOne({ _id: req.body.userId });
  const otherUser = await User.findOne({ _id: req.body.otherUserId });
  for (let i = 0; i < user.following.length; i++) {
    if (user.following[i] == req.body.otherUserId) {
      otherUser.status = 1;
      break;
    }
  }
  const otherUserObject = otherUser.toJSON();

  delete otherUserObject.password;
  delete otherUserObject.tokens;
  delete otherUserObject.securityQuestion;
  delete otherUserObject.securityQuestionAnswer;
  res.send({ otherUser: otherUserObject });
});

router.post('/edituser', authenticate, async (req, res) => {
  console.log(req.body);

  const user = await User.updateOne(
    { _id: req.body.userId },
    { $set: req.body }
  );
  if (!user) {
    res.status(404);
  }
  res.status(200).send({ msg: 'done' });
});

router.post('/login', async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  var user = await User.findOne({ email: email });
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
    const userObject = user.toJSON();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.securityQuestion;
    delete userObject.securityQuestionAnswer;

    return res.send({
      user: userObject,
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

  var user = await Account.findOne({
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
  var newUser = await user.save();
  const userObject = newUser.toJSON();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.securityQuestion;
  delete userObject.securityQuestionAnswer;
  return res.status(200).send({
    user: userObject
  });
});

router.post('/updateimage', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      {
        _id: req.body.userid
      },
      {
        imageurl: req.body.imageurl
      },
      { new: true }
    );
    res.status(200).send({
      msg: req.body.imageurl
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      msg: error
    });
  }
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

router.post('/search', authenticate, async (req, res) => {
  try {
    let finalUsers = [];
    const search = req.body.search;
    const discussions = await Disscusion.find({
      $or: [
        { keywords: new RegExp(search) },
        { title: new RegExp(search) },
        { desc: new RegExp(search) }
      ]
    });
    const users = await User.find({
      $or: [{ name: new RegExp(search) }, { username: new RegExp(search) }]
    }).select('-password -tokens -securityQuestion -securityQuestionAnswer');
    res.status(200).send({ discussions, users });
  } catch (error) {
    res.status(400).send({
      msg: 'error ya sisa'
    });
  }
});

router.post('/checkEmail', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("user doesn't exist");
    }
    res.status(200).send({ securityQuestion: user.securityQuestion });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/checkSecurityQuestion', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("user doesn't exist");
    }
    if (user.securityQuestionAnswer === req.body.securityQuestionAnswer) {
      res.status(200).send({ data: true });
    } else {
      res.status(200).send({ data: false });
    }
  } catch (error) {
    res.status(400).send({
      msg: error
    });
  }
});

router.post('/changeForgotPassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("user doesn't exist");
    }
    newPassword = req.body.newPassword;
    var ciphertext = CryptoJS.AES.encrypt(newPassword, 'cabonourhanysisa1997');
    user.password = ciphertext;
    await user.save();
    return res.status(200).send({
      status: true
    });
  } catch (error) {
    res.status(400).send({
      msg: error
    });
  }
});

module.exports = router;
