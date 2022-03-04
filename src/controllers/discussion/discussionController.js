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
  let discs = await Disscusion.find();
  res.status(200).send(discs);

  // hena el code dah bygyb el last post user name 3shan yt7at fel discussions el fel home page

  // let lastPostUserName = "";
  // for (let i = 0; i < discs.length; i++) {
  //   const muser = await User.findById({
  //     _id: discs[i].userid[0],
  //   });
  //   if (discs[i].comments.length != 0) {
  //     let lastCommenId = discs[i].comments.pop();
  //     const lastComment = await Comment.findById({
  //       _id: lastCommenId,
  //     });
  //     const lastPostUser = await User.findById({
  //       _id: lastComment.commentor[0],
  //     });
  //     lastPostUserName = _.pick(lastPostUser, ["name", "imageurl"]);
  //     discs[i].lastCommentUserName = lastPostUserName.name;
  //   } else {
  //     lastPostUserName = _.pick(muser, ["name", "imageurl"]);
  //     discs[i].lastCommentUserName = lastPostUserName.name;
  //   }
  //   let result = _.pick(discs[i], [
  //     "_id",
  //     "desc",
  //     "title",
  //     "category",
  //     "lastCommentUserName",
  //     "imageurl",
  //     "createdAt",
  //   ]);
  //   discs[i] = result;
  // }
});

router.get("/:discId", async (req, res) => {
  let disc = await Disscusion.findOne({
    _id: req.params.discId,
  });
  res.status(200).send(disc);

  // hena el code dah bygyb el comments bta3t el discussion w bya5od wa2t kbeer fash5 700ms w law commented bya5od 400ms

  // const mainUser = await User.findById({
  //   _id: disc.userid[0],
  // });
  // let filteredMainUser = _.pick(mainUser, ["_id", "name", "imageurl"]);
  // disc.userid[0] = filteredMainUser;

  // if (disc.comments.length != 0) {
  //   for (let j = 0; j < disc.comments.length; j++) {
  //     const mainComment = await Comment.findById({
  //       _id: disc.comments[j]._id,
  //     });
  //     const user = await User.findById({
  //       _id: mainComment.commentor[0],
  //     });
  //     let filteredUser = _.pick(user, ["_id", "name", "imageurl"]);
  //     mainComment.commentor[0] = filteredUser;
  //     disc.comments[j] = mainComment;
  //   }
  // }

  // if (disc.users.length != 0) {
  //   for (let k = 0; k < disc.users.length; k++) {
  //     const el = await User.findById({
  //       _id: disc.users[k]._id,
  //     });
  //     let result = _.pick(el, ["_id", "name"], "imageurl");
  //     disc.users[k] = result;
  //   }
  // }
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

router.post("/creatediss", async (req, res) => {
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

router.post("/stardisc", authenticate, async (req, res) => {
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

router.post("/unstardisc", authenticate, async (req, res) => {
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

router.post("/updateimage", authenticate, async (req, res) => {
  try {
    const user = await Disscusion.findByIdAndUpdate(
      {
        _id: req.body.discId,
      },
      {
        imageurl: req.body.imageurl,
      },
      { new: true }
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
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
