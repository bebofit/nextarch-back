var express = require('express');
var bodyParser = require('body-parser');
const _ = require('lodash')

var router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());
//midddleware
const {
    authenticate
  } = require('../middleware/authenticate')
//models
const {
    User
} = require('../models/User');
const {
    Disscusion
} = require('../models/Disscusion');

module.exports = router;