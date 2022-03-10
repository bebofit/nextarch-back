var express = require("express");
var bodyParser = require("body-parser");
const _ = require("lodash");
const { authenticate } = require("../../middleware/authenticate");
const { User } = require("../../models/User");
const { Disscusion } = require("../../models/disscusion");
const { Comment } = require("../../models/comment");

var router = express.Router();
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());

router.get("/", async (req, res) => {
  let discs = await Disscusion.find().populate({
    path: 'comments',
    options: { 
      limit: 1,
      sort: { $natural : -1 }
    },
    populate: { 
      path: 'commentor',
      select: 'name'
    }
  })
  return res.json(discs)
});

router.get("/:discId", async (req, res) => {
  let disc = await Disscusion.findOne({
    _id: req.params.discId,
  }).populate({
    path: 'comments',
    populate: { 
      path: 'commentor',
      select: 'name'
    }
  });
  res.status(200).send(disc);
});

router.post("/getmydiscs", authenticate, async (req, res) => {
  let discs = await Disscusion.find({
    userid: [req.body.userid],
  });
  res.status(200).send(discs);
  // for (let i = 0; i < discs.length; i++) {
  //   if (discs[i].comments.length != 0) {
  //     for (let j = 0; j < discs[i].comments.length; j++) {
  //       const element = await Comment.findById({
  //         _id: discs[i].comments[j]._id,
  //       });
  //       const user = await User.findById({
  //         _id: element.commentor[0],
  //       });
  //       let result = _.pick(user, ["_id", "name", "imageurl"]);
  //       element.commentor[0] = result;
  //       discs[i].comments[j] = element;
  //     }
  //     if (discs[i].users.length != 0) {
  //       for (let k = 0; k < discs[i].users.length; k++) {
  //         const el = await User.findById({
  //           _id: discs[i].users[k]._id,
  //         });
  //         let result = _.pick(el, ["_id", "name", "imageurl"]);
  //         discs[i].users[k] = result;
  //       }
  //     }
  //   }
  // }
});

router.post("/", async (req, res) => {
  try {
    const discus = await new Disscusion({
      title: req.body.title,
      desc: req.body.desc,
      category: req.body.category,
      keywords: req.body.keywords,
      imageurl: req.body.imageurl,
      userid: req.body.userid,
      users: [req.body.userid],
    }).save();
    res.send({
      msg: true,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post(
  "/checkLikedCommentsForDiscByUser",
  authenticate,
  async (req, res) => {
    const commentsStatus = [];
    let flag = false;
    const disc = await Disscusion.findById({ _id: req.body.discId });
    if (disc.comments.length != 0) {
      for (let j = 0; j < disc.comments.length; j++) {
        const mainComment = await Comment.findById({
          _id: disc.comments[j]._id,
        });
        for (let k = 0; k < mainComment.likesarray.length; k++) {
          if (mainComment.likesarray[k] == req.body.userId) {
            flag = true;
            break;
          }
        }
        if (flag) {
          commentsStatus.push(1);
        } else {
          commentsStatus.push(0);
        }
      }
    }
    res.status(200).send(commentsStatus);
  }
);

router.post("/checkDisckStarredByUser", authenticate, async (req, res) => {
  let discStatus = 0;
  const user = await User.findById({
    _id: req.body.userId,
  });
  const disc = await Disscusion.findById({ _id: req.body.discId });
  if (user) {
    if (user.favdisc.length != 0) {
      for (let i = 0; i < user.favdisc.length; i++) {
        const discidTemp = user.favdisc[i];
        if (discidTemp == req.body.discId) {
          discStatus = 1;
          break;
        }
      }
    }
  }
  res.status(200).send({ status: discStatus });
});

router.post("/getMyStarredDiscs", authenticate, async (req, res) => {
  try {
    let finalStarredDiscs = [];
    const user = await User.findById({ _id: req.body.userId });
    for (let i = 0; i < user.favdisc.length; i++) {
      const discussion = await Disscusion.findById({ _id: user.favdisc[i] });
      const filteredDisc = _.pick(discussion, [
        "_id",
        "desc",
        "title",
        "category",
        "createdAt",
        "imageurl",
      ]);
      finalStarredDiscs.push(filteredDisc);
    }
    res.status(200).send({ data: finalStarredDiscs });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/star", authenticate, async (req, res) => {
  try {
    let dis = await User.findByIdAndUpdate(
      {
        _id: req.body.userid,
      },
      {
        $addToSet: {
          favdisc: req.body.disid,
        },
      }
    );

    res.status(200).send({
      msg: "starred disc",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/unStar", authenticate, async (req, res) => {
  try {
    let dis = await User.findByIdAndUpdate(
      {
        _id: req.body.userid,
      },
      {
        $pull: {
          favdisc: req.body.disid,
        },
      }
    );

    res.status(200).send({
      msg: "unstarred disc",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/trending", async (req, res) => {
  let discs = await Disscusion.aggregate([
    {
      $project: {
        _id: 1,
        desc: 1,
        title: 1,
        category: 1,
        createdAt: 1,
        imageurl: 1,
        length: { $size: "$users" },
      },
    },
    { $sort: { length: -1 } },
    { $limit: 5 },
  ]);
  return res.status(200).send({ discs });
});

router.post("/latest", async (req, res) => {
  let finalDiscs = [];
  const discs = await Disscusion.find({}).sort("-createdAt");
  for (let k = 0; k < 5; k++) {
    if (k >= discs.length) break;
    const filteredDisc = _.pick(discs[k], [
      "_id",
      "desc",
      "title",
      "category",
      "createdAt",
      "imageurl",
    ]);
    finalDiscs.push(filteredDisc);
  }
  return res.status(200).send({ discs: finalDiscs });
});

module.exports = router;
