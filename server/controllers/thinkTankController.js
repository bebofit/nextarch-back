const { Form } = require('../models/Form');
const { Disscusion } = require('../models/disscusion');
const { PrivateDisscusion } = require('../models/private-discusion');
const { adminMiddleware } = require('../middleware/admin-middleware');
const { authenticate } = require('../middleware/authenticate');
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

router.post('/createForm', async (req, res) => {
  try {
    const form = await Form.create({
      title: req.body.title,
      finalquestion: req.body.finalquestion,
      outputs: req.body.outputs,
      stakeholders: [req.body.stakeholders],
      challenges: req.body.challenges,
      constitution: req.body.constitution
    });
    return res.send({ form });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('rejectForm', async (req, res) => {
  try {
    await Form.findByIdAndDelete({ _id: req.body.formId });
    res.sendStatus(202);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/accecptForm', async (req, res) => {
  try {
    const discId = req.body.descId;
    const formId = req.body.formId;
    const disc = await Disscusion.findOne({ _id: discId });
    const form = await Form.findOne({ _id: formId });
    const privateDisc = await PrivateDisscusion.create({
      title: disc.title,
      desc: disc.desc,
      category: disc.category,
      keywords: disc.keywords,
      imageurl: disc.imageurl,
      Disc: discId,
      userid: disc.userid,
      comments: disc.comments,
      lastpost: disc.lastpost,
      users: form.stakeholders
    });
    await Disscusion.findByIdAndUpdate(
      { _id: discId },
      { $set: { privateDisc: privateDisc._id } }
    );
    await Form.findByIdAndDelete({ _id: formId });
    return res.send({ privateDisc });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
