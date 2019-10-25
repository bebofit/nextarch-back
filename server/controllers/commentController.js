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
const {
    Comment
} = require('../models/comment');

router.post('/createcomment',authenticate, async(req,res)=>{
    try {
      let createdat = new Date();
      
        let comment = await new Comment({
            imageurl: req.body.imageurl,
            commentor: [req.body.commentor],
            desc: req.body.desc,
            createdat
        }).save()

        let dis = await Disscusion.findByIdAndUpdate({
            _id: req.body.disid
          }, {
            $push: {
                comments: comment._id
            },
            $addToSet: {
              users: req.body.commentor
            }
          })
          
        res.status(200).send({
            msg: 'created comment'
          });
    
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/createsubcomment',authenticate, async(req,res)=>{
    try {
        let comment = await new Comment({
            imageurl: req.body.imageurl,
            commentor: req.body.userid,
            desc: req.body.desc
        }).save()

        let maincomment = await Comment.findByIdAndUpdate({
            _id: req.body.mainid
          }, {
            $push: {
              following: comment._id
            }
          })

          res.status(200).send({
            msg: 'created subcomment'
          });
    
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/likecomment',authenticate, async(req,res)=>{
  try {

      let maincomment = await Comment.findByIdAndUpdate({
          _id: req.body.id
        }, {
          $inc: {
            likes: 1
          }
        })

        res.status(200).send({
          msg: 'liked'
        });
  
  } catch (error) {
      res.status(400).send(error)
  }
})

router.post('/unlikecomment',authenticate, async(req,res)=>{
  try {

      let maincomment = await Comment.findByIdAndUpdate({
          _id: req.body.id
        }, {
          $inc: {
            likes: -1
          }
        })

        res.status(200).send({
          msg: 'liked'
        });
  
  } catch (error) {
      res.status(400).send(error)
  }
})

module.exports = router;