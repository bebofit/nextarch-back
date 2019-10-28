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
//midddleware
const { authenticate } = require('../middleware/authenticate');
//models
const { User } = require('../models/User');
const { Disscusion } = require('../models/Disscusion');
const { Comment } = require('../models/comment');

router.post('/creatediss', async (req, res) => {
  try {
    let discus = await new Disscusion({
      title: req.body.title,
      desc: req.body.desc,
      category: req.body.category,
      keywords: req.body.keywords,
      imageurl: req.body.imageurl,
      userid: req.body.userid,
      users: [req.body.userid]
    }).save();

    res.send({
      msg: true
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/getdiscbyid', authenticate, async (req, res) => {
  let discs = await Disscusion.find({
    _id: req.body.discid
  });

  for (let i = 0; i < discs.length; i++) {
    const muser = await User.findById({
      _id: discs[i].userid[0]
    });

    let result = _.pick(muser, ['_id', 'name']);
    discs[i].userid[0] = result;

    //To check if starred or not
    discs[i].status = 0;
    if (muser.favdisc.length != 0) {
      for (let i = 0; i < muser.favdisc.length; i++) {
        const discidTemp = muser.favdisc[i];
        if (discidTemp == req.body.discid) {
          discs[i].status = 1;
          break;
        }
      }
    }

    if (discs[i].comments.length != 0) {
      for (let j = 0; j < discs[i].comments.length; j++) {
        const element = await Comment.findById({
          _id: discs[i].comments[j]._id
        });
        const user = await User.findById({
          _id: element.commentor[0]
        });
        let result = _.pick(user, ['_id', 'name']);
        element.commentor[0] = result;
        // if(element.subcomments.length != 0)
        // {
        //     for (let k = 0; k < element.subcomments.length; k++) {
        //         const el = await Comment.findById({_id: element.subcomments[k]._id});
        //         element.subcomments[k] = el
        //     }

        // }

        discs[i].comments[j] = element;
      }
      if (discs[i].users.length != 0) {
        for (let k = 0; k < discs[i].users.length; k++) {
          const el = await User.findById({
            _id: discs[i].users[k]._id
          });
          let result = _.pick(el, ['_id', 'name']);
          discs[i].users[k] = result;
        }
      }
    }
  }
  res.status(200).send(discs);
});

router.post('/getMyStarredDiscs', authenticate, async (req, res) => {
  try {
    let finalStarredDiscs = [];
    const user = await User.findById({ _id: req.body.userId });
    for (let i = 0; i < user.favdisc.length; i++) {
      const discussion = await Disscusion.findById({ _id: user.favdisc[i] });
      const filteredDisc = _.pick(discussion, [
        '_id',
        'desc',
        'title',
        'category'
      ]);
      finalStarredDiscs.push(filteredDisc);
    }
    res.status(200).send({ data: finalStarredDiscs });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/getalldisc', async (req, res) => {
  let discs = await Disscusion.find({});
  let lastPostUserName = '';
  for (let i = 0; i < discs.length; i++) {
    const muser = await User.findById({
      _id: discs[i].userid[0]
    });
    if (discs[i].comments.length != 0) {
      let lastCommenId = discs[i].comments.pop();
      const lastComment = await Comment.findById({
        _id: lastCommenId
      });
      const lastPostUser = await User.findById({
        _id: lastComment.commentor[0]
      });
      lastPostUserName = _.pick(lastPostUser, ['name']);
      discs[i].lastCommentUserName = lastPostUserName.name;
    } else {
      lastPostUserName = _.pick(muser, ['name']);
      discs[i].lastCommentUserName = lastPostUserName.name;
    }
    let result = _.pick(discs[i], [
      '_id',
      'desc',
      'title',
      'category',
      'lastCommentUserName'
    ]);
    discs[i] = result;
  }
  res.status(200).send({ discs });
});

router.post('/stardisc', authenticate, async (req, res) => {
  try {
    let dis = await User.findByIdAndUpdate(
      {
        _id: req.body.userid
      },
      {
        $addToSet: {
          favdisc: req.body.disid
        }
      }
    );

    res.status(200).send({
      msg: 'starred disc'
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/unstardisc', authenticate, async (req, res) => {
  try {
    let dis = await User.findByIdAndUpdate(
      {
        _id: req.body.userid
      },
      {
        $pull: {
          favdisc: req.body.disid
        }
      }
    );

    res.status(200).send({
      msg: 'unstarred disc'
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
