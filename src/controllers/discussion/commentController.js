var express = require("express");
var bodyParser = require("body-parser");
//midddleware
const { authenticate } = require("../../middleware/authenticate");
//models
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

router.post("/createcomment", authenticate, async (req, res) => {
  try {
    let createdat = new Date();

    let comment = await new Comment({
      imageurl: req.body.imageurl,
      commentor: [req.body.commentor],
      desc: req.body.desc,
      createdat,
    }).save();

    let dis = await Disscusion.findByIdAndUpdate(
      {
        _id: req.body.disid,
      },
      {
        $push: {
          comments: comment._id,
        },
        $addToSet: {
          users: req.body.commentor,
        },
      }
    );
    await User.update(
      { _id: req.body.commentor },
      {
        $addToSet: {
          activeDiscs: req.body.disid,
        },
      }
    );
    res.status(200).send({
      msg: "created comment",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/likecomment", authenticate, async (req, res) => {
  try {
    let maincomment = await Comment.findByIdAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $inc: {
          likes: 1,
        },
        $push: {
          likesarray: req.body.userId,
        },
      }
    );
    await User.update(
      { _id: req.body.userId },
      {
        $addToSet: {
          activeDiscs: req.body.discId,
        },
      }
    );
    res.status(200).send({
      msg: "liked",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/unlikecomment", authenticate, async (req, res) => {
  try {
    let maincomment = await Comment.findByIdAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $inc: {
          likes: -1,
        },
        $pull: {
          likesarray: req.body.userId,
        },
      }
    );

    res.status(200).send({
      msg: "liked",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/updateimage", authenticate, async (req, res) => {
  try {
    const user = await Comment.findByIdAndUpdate(
      {
        _id: req.body.commId,
      },
      {
        imageurl: req.body.imageurl,
      },
      { new: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.status(400).send({
      msg: error,
    });
  }
});

module.exports = router;
