const { Admin } = require("../models/Admin");
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

router.post("/signupAsAdmin", async (req, res) => {
  try {
    if (req.body.adminPass != "nextArchRocksByBNP2019") {
      return res.sendStatus(403);
    }
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      "cabonourhanysisa1997"
    );
    const admin = await Admin.create({
      email: req.body.email,
      adminname: req.body.adminname,
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

router.post("/login", async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  const admin = await Admin.findOne({ email: email });
  if (!admin) {
    return res.status(400).send({ msg: "No admin exsist!" });
  }
  let bytes = CryptoJS.AES.decrypt(
    admin.password.toString(),
    "cabonourhanysisa1997"
  );
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (plaintext != password) {
    return res.status(400).send({ msg: "Invalid Password" });
  } else {
    const token = jwt.sign({ isAdmin: true, adminId: admin._id }, "nourhany");
    const adminObject = admin.toJSON();
    delete adminObject.password;

    return res.send({
      admin: adminObject,
      token: token,
    });
  }
});

module.exports = router;
