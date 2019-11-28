const { Admin } = require('../models/Admin');
const { Disscusion } = require('../models/disscusion');

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

router.get('/getAllAdmins', adminMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.send({ admins }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/getAdminById/:adminId', adminMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: req.params.adminId }).select(
      '-password'
    );
    res.send({ admin }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/createAdmin', adminMiddleware, async (req, res) => {
  try {
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

router.patch('/updateAdmin', adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      'cabonourhanysisa1997'
    );
    const admin = await Admin.findByIdAndUpdate(
      { _id: req.body.adminId },
      {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        password: ciphertext
      },
      { new: true }
    );
    const adminObject = admin.toJSON();
    delete adminObject.password;
    res.send({
      admin: adminObject
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/deleteAdmin/:adminId', adminMiddleware, async (req, res) => {
  try {
    if (req.body.adminPass != 'DeletingAndIamSure2019') {
      return res.sendStatus(403);
    }
    await Admin.deleteOne({ _id: req.params.adminId });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

//BAAAA Disscusions
router.get('/getAllDiscs', adminMiddleware, async (req, res) => {
  try {
    const discs = await Disscusion.find({}).select('-password');
    res.send({ discs }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/getDiscById/:discId', adminMiddleware, async (req, res) => {
  try {
    const disc = await Disscusion.findById({ _id: req.params.discId }).select(
      '-password'
    );
    res.send({ disc }).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/createDisc', adminMiddleware, async (req, res) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(
      req.body.password,
      'cabonourhanysisa1997'
    );
    const disc = await Disscusion.create({
      title: req.body.title,
      desc: req.body.desc,
      category: req.body.category,
      keywords: req.body.keywords,
      imageurl: req.body.imageurl,
      userid: req.body.userid,
      users: [req.body.userid]
    });
    const adminObject = admin.toJSON();
    delete adminObject.password;
    const token = jwt.sign({ isAdmin: true, discId: admin._id }, 'nourhany');
    res.send({
      admin: adminObject,
      token
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/updateDisc', adminMiddleware, async (req, res) => {
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
        users: [req.body.userid]
      },
      { new: true }
    );
    res.send({
      disc
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/deleteDisc/:discId', adminMiddleware, async (req, res) => {
  try {
    if (req.body.adminPass != 'DeletingAndIamSure2019') {
      return res.sendStatus(403);
    }
    await Disscusion.deleteOne({ _id: req.params.discId });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
