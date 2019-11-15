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
const { Disscusion } = require('../models/disscusion');
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

router.get('/getdiscbyid/:discId', async (req, res) => {
  let discs = await Disscusion.find({
    _id: req.params.discid
  });

  for (let i = 0; i < discs.length; i++) {
    const muser = await User.findById({
      _id: discs[i].userid[0]
    });

    let result = _.pick(muser, ['_id', 'name']);
    discs[i].userid[0] = result;

    if (discs[i].comments.length != 0) {
      for (let j = 0; j < discs[i].comments.length; j++) {
        const mainComment = await Comment.findById({
          _id: discs[i].comments[j]._id
        });
        const user = await User.findById({
          _id: mainComment.commentor[0]
        });
        for (let k = 0; k < mainComment.likesarray.length; k++) {
          if (mainComment.likesarray[k] == req.body.userId) {
            mainComment.status = 1;
            break;
          }
          mainComment.status = 0;
        }
        let result = _.pick(user, ['_id', 'name']);
        mainComment.commentor[0] = result;

        discs[i].comments[j] = mainComment;
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

router.post('checkDisckStarredByUser', authenticate, async (req, res) => {
  const user = await User.findById({
    _id: req.body.userId
  });
  const disc = await Disscusion.findById({ _id: req.body.discId });
  discs.status = 0;
  if (user) {
    if (user.favdisc.length != 0) {
      for (let i = 0; i < user.favdisc.length; i++) {
        const discidTemp = user.favdisc[i];
        if (discidTemp == req.body.discId) {
          discs.status = 1;
          break;
        }
      }
    }
  }
  res.status(200).send(discs);
});

router.post('/getmydiscs', authenticate, async (req, res) => {
  let discs = await Disscusion.find({
    userid: [req.body.userid]
  });

  for (let i = 0; i < discs.length; i++) {
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
        'category',
        'createdAt',
        'imageurl'
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
      'lastCommentUserName',
      'imageurl'
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

router.post('/updateimage', authenticate, async (req, res) => {
  try {
    const user = await Disscusion.findByIdAndUpdate(
      {
        _id: req.body.discId
      },
      {
        imageurl: req.body.imageurl
      },
      { new: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.status(400).send({
      msg: error
    });
  }
});

router.post('/trending', async (req, res) => {
  let discs = await Disscusion.aggregate([
    {
      $project: {
        _id: 1,
        desc: 1,
        title: 1,
        category: 1,
        createdAt: 1,
        imageurl: 1,
        length: { $size: '$users' }
      }
    },
    { $sort: { length: -1 } },
    { $limit: 5 }
  ]);
  return res.status(200).send({ discs });
});

router.post('/latest', async (req, res) => {
  let finalDiscs = [];
  const discs = await Disscusion.find({}).sort('-createdAt');
  for (let k = 0; k < 5; k++) {
    if (k >= discs.length) break;
    const filteredDisc = _.pick(discs[k], [
      '_id',
      'desc',
      'title',
      'category',
      'createdAt',
      'imageurl'
    ]);
    finalDiscs.push(filteredDisc);
  }
  return res.status(200).send({ discs: finalDiscs });
});

module.exports = router;
