const { Admin } = require("../models/Admin");
const { User } = require("../models/User");
const { Disscusion } = require("../models/disscusion");
const { PrivateDisscusion } = require("../models/private-discusion");
const { Comment } = require("../models/comment");
const { Form } = require("../models/Form");
const { adminMiddleware } = require("../middleware/admin-middleware");
var CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
var express = require("express");
var bodyParser = require("body-parser");
const _ = require("lodash");

var router = express.Router();
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());

router.get("/getAllAdmins", adminMiddleware, async (req, res) => {
  try {
    const admins = await Admin.findOne({}).select("-password");
    res.send({ admins }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getAdminById/:adminId", adminMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: req.params.adminId }).select(
      "-password"
    );
    res.send({ admin }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/createAdmin", adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      "cabonourhanysisa1997"
    );
    const admin = await Admin.create({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      password: ciphertext,
    });
    const adminObject = admin.toJSON();
    delete adminObject.password;
    const token = jwt.sign({ isAdmin: true, adminId: admin._id }, "nourhany");
    res.send({
      admin: adminObject,
      token,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updateAdmin", adminMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      { _id: req.body.adminId },
      {
        $set: {
          email: req.body.email,
          username: req.body.username,
          name: req.body.name,
        },
      },
      { new: true }
    );
    const adminObject = admin.toJSON();
    delete adminObject.password;
    res.send({
      admin: adminObject,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/deleteAdmin/:adminId", adminMiddleware, async (req, res) => {
  try {
    if (req.body.adminPass != "DeletingAndIamSure2019") {
      return res.sendStatus(403);
    }
    await Admin.deleteOne({ _id: req.params.adminId });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

//BAAAA Users

router.get("/getAllUsers", adminMiddleware, async (req, res) => {
  try {
    const users = await User.findOne({})
      .select("-password -tokens -securityQuestionAnswer")
      .populate("favdisc")
      .populate("favproj")
      .populate("followers", "name")
      .populate("following", "name");
    res.send({ users }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getUserById/:userId", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.userId })
      .select("-password -tokens -securityQuestionAnswer")
      .populate("favdisc")
      .populate("favproj")
      .populate("followers", "name")
      .populate("following", "name");
    res.send({ user }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/createUser", adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      "cabonourhanysisa1997"
    );
    const createdAt = new Date();
    const user = await User.create({
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
      createdAt,
    });

    const token = jwt.sign({}, "nourhany");
    res.send({
      user,
      token,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updateUser", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $set: {
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
        },
      },
      { new: true }
    );

    res.send({
      user,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/deleteUser/:userId", adminMiddleware, async (req, res) => {
  try {
    if (req.body.adminPass != "DeletingAndIamSure2019") {
      return res.sendStatus(403);
    }
    await User.deleteOne({ _id: req.params.userId });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

//BAAAA Disscusions
router.get("/getAllDiscs", adminMiddleware, async (req, res) => {
  try {
    const discs = await Disscusion.findOne({})
      .populate({
        path: "comments",
        populate: { path: "commentor" },
      })
      .populate("userid", "name")
      .populate("users", "name");
    res.send({ discs }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getDiscById/:discId", adminMiddleware, async (req, res) => {
  try {
    const disc = await Disscusion.findById({ _id: req.params.discId })
      .populate({
        path: "comments",
        select: "imageurl commentor",
        populate: { path: "commentor", select: "name imageurl" },
      })
      .populate("userid", "name")
      .populate("users", "name");
    res.send({ disc }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/createDisc", adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      "cabonourhanysisa1997"
    );
    const disc = await Disscusion.create({
      title: req.body.title,
      desc: req.body.desc,
      category: req.body.category,
      keywords: req.body.keywords,
      imageurl: req.body.imageurl,
      userid: req.body.userid,
      users: [req.body.userid],
    });
    res.send({
      disc,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updateDisc", adminMiddleware, async (req, res) => {
  try {
    const disc = await Disscusion.findByIdAndUpdate(
      { _id: req.body.discId },
      {
        title: req.body.title,
        desc: req.body.desc,
        category: req.body.category,
        keywords: req.body.keywords,
        imageurl: req.body.imageurl,
        userid: req.body.userid,
        users: [req.body.userid],
      },
      { new: true }
    );
    res.send({
      disc,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/deleteDisc/:discId", adminMiddleware, async (req, res) => {
  try {
    if (req.body.adminPass != "DeletingAndIamSure2019") {
      return res.sendStatus(403);
    }
    await Disscusion.deleteOne({ _id: req.params.discId });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

//BAAAA Private Disscusions
router.get("/getAllPrivateDiscs", adminMiddleware, async (req, res) => {
  try {
    const discs = await PrivateDisscusion.findOne({})
      .populate({
        path: "comments",
        select: "imageurl commentor",
        populate: { path: "commentor", select: "name imageurl" },
      })
      .populate("userid", "name")
      .populate("users", "name");
    res.send({ discs }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getPrivateDiscById/:discId", adminMiddleware, async (req, res) => {
  try {
    const disc = await PrivateDisscusion.findById({
      _id: req.params.discId,
    })
      .populate({
        path: "comments",
        select: "imageurl commentor",
        populate: { path: "commentor", select: "name imageurl" },
      })
      .populate("userid", "name")
      .populate("users", "name");
    res.send({ disc }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/createPrivateDisc", adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      "cabonourhanysisa1997"
    );
    const disc = await PrivateDisscusion.create({
      title: req.body.title,
      desc: req.body.desc,
      category: req.body.category,
      keywords: req.body.keywords,
      imageurl: req.body.imageurl,
      Disc: req.body.disc,
      userid: req.body.userid,
      users: [req.body.userid],
    });
    res.send({
      disc,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updatePrivateDisc", adminMiddleware, async (req, res) => {
  try {
    const disc = await PrivateDisscusion.findByIdAndUpdate(
      { _id: req.body.discId },
      {
        title: req.body.title,
        desc: req.body.desc,
        category: req.body.category,
        keywords: req.body.keywords,
        imageurl: req.body.imageurl,
        userid: req.body.userid,
        users: [req.body.userid],
      },
      { new: true }
    );
    res.send({
      disc,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete(
  "/deletePrivateDisc/:discId",
  adminMiddleware,
  async (req, res) => {
    try {
      if (req.body.adminPass != "DeletingAndIamSure2019") {
        return res.sendStatus(403);
      }
      await PrivateDisscusion.deleteOne({ _id: req.params.discId });
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

//BAAAA Comments
router.get("/getAllComments", adminMiddleware, async (req, res) => {
  try {
    const comments = await Comment.findOne({})
      .populate("commentor", "name imageurl")
      .populate("likesarray", "name");
    res.send({ comments }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getCommentById/:commentId", adminMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById({
      _id: req.params.commentId,
    })
      .populate("commentor", "name")
      .populate("likesarray", "name");
    res.send({ comment }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/createComment", adminMiddleware, async (req, res) => {
  try {
    let createdat = new Date();
    const comment = await Comment.create({
      imageurl: req.body.imageurl,
      commentor: [req.body.commentor],
      desc: req.body.desc,
      createdat,
    });
    res.send({
      comment,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updateComment", adminMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      { _id: req.body.commentId },
      {
        imageurl: req.body.imageurl,
        commentor: [req.body.commentor],
        desc: req.body.desc,
        createdat,
      },
      { new: true }
    );
    res.send({
      comment,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete(
  "/deleteComment/:commentId",
  adminMiddleware,
  async (req, res) => {
    try {
      if (req.body.adminPass != "DeletingAndIamSure2019") {
        return res.sendStatus(403);
      }
      await Comment.deleteOne({ _id: req.params.commentId });
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

//BAAAA FORMS
router.get("/getAllForms", adminMiddleware, async (req, res) => {
  try {
    const forms = await Form.findOne({}).populate("stakeholders", "name");
    res.send({ forms }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getFormById/:formId", adminMiddleware, async (req, res) => {
  try {
    const form = await Form.findById({
      _id: req.params.formId,
    }).populate("stakeholders", "name");
    res.send({ form }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
