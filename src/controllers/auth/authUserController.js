const { User } = require("../../models/User");
const { authenticate } = require("../../middleware/authenticate");
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require("body-parser");

var router = express.Router();
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());

router.post("/signup", (req, res) => {
  let createdAt = new Date();
  var ciphertext = CryptoJS.AES.encrypt(
    req.body.password,
    "cabonourhanysisa1997"
  );
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
    createdAt,
  });
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      const userObject = user.toJSON();
      delete userObject.password;
      delete userObject.tokens;
      delete userObject.securityQuestion;
      delete userObject.securityQuestionAnswer;
      res.send({
        user,
        token: token,
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post("/login", async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  var user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .send({ msg: "No User With That Email Exists, Yet!" });
  }
  let bytes = CryptoJS.AES.decrypt(
    user.password.toString(),
    "cabonourhanysisa1997"
  );
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (plaintext != password) {
    return res.status(400).send({ msg: "Invalid Password" });
  } else {
    const token = await user.generateAuthToken();
    const userObject = user.toJSON();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.securityQuestion;
    delete userObject.securityQuestionAnswer;
    return res.send({
      user: userObject,
      token: token,
    });
  }
});

router.delete("/me/token", authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send({
      msg: "Removed Token!",
    });
  } catch (error) {
    res.status(400).send();
  }
});

router.post("/changePassword", authenticate, async (req, res) => {
  userID = req.body.userid;
  old = req.body.old;
  newPassword = req.body.newPassword;

  var user = await Account.findOne({
    _id: userID,
  }).exec();
  if (!user) {
    return res.status(400).send({
      msg: "Invalid credentials",
    });
  }

  let bytes = CryptoJS.AES.decrypt(
    user.password.toString(),
    "cabonourhanysisa1997"
  );
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (plaintext != old) {
    return res.status(400).send({
      msg: "Invalid Password",
    });
  }
  var ciphertext = CryptoJS.AES.encrypt(newPassword, "cabonourhanysisa1997");

  user.password = ciphertext;
  var newUser = await user.save();
  const userObject = newUser.toJSON();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.securityQuestion;
  delete userObject.securityQuestionAnswer;
  return res.status(200).send({
    user: userObject,
  });
});

router.post("/checkEmail", async (req, res) => {
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

router.post("/checkSecurityQuestion", async (req, res) => {
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
      msg: error,
    });
  }
});

router.post("/changeForgotPassword", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("user doesn't exist");
    }
    newPassword = req.body.newPassword;
    var ciphertext = CryptoJS.AES.encrypt(newPassword, "cabonourhanysisa1997");
    user.password = ciphertext;
    await user.save();
    return res.status(200).send({
      status: true,
    });
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
  }
});

module.exports = router;
