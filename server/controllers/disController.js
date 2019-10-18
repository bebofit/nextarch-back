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


router.post('/creatediss', async (req, res) => {
    try {
        let discus = await new Disscusion({
            title: req.body.title,
            desc: req.body.desc,
            category: req.body.category,
            keywords: req.body.keywords,
            imageurl: req.body.imageurl,
            userid: req.body.userid
        }).save()

        res.send({
            msg: true
        })
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/favdisc',authenticate, async(req,res)=>{
    try {
        
        const di = await User.findByIdAndUpdate({_id: req.body.userid}, {
            $push: {
                favdisc: req.body.disid
            }
         })

         res.status(200).send({msg: 'done'});

    } catch (error) {
        res.status(400).send(error);
    }
})

router

module.exports = router;