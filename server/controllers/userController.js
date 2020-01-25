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

router.post('/getuser', authenticate, async (req, res) => {
  var user = await User.findOne({ _id: req.body.id })
    .select('-password -tokens -securityQuestion -securityQuestionAnswer')
    .populate('followers', 'name desc imageurl username')
    .populate('following', 'name desc imageurl username');
  res.send(user);
});

router.post('/getNotifications', authenticate, async (req, res) => {
  const user = await User.findOne({ _id: req.body.id })
    .select('notification')
    .populate('notification');
  res.send(user).status(200);
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

module.exports = router;
