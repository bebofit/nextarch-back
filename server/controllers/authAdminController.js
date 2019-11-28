const { Admin } = require('../models/Admin');
const { adminMiddleware } = require('../middleware/admin-middleware');
var CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
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

router.post('/signupAsAdmin', async (req, res) => {
  try {
    if (req.body.adminPass != 'nextArchRocksByBNP2019') {
      return res.sendStatus(403);
    }
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      'cabonourhanysisa1997'
    );
    const admin = await Admin.create({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      password: ciphertext
    });
    const adminObject = admin.toJSON();
    delete adminObject.password;
    const token = jwt.sign({ isAdmin: true, adminId: admin._id }, 'nourhany');
    res.send({
      admin: adminObject,
      token
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
