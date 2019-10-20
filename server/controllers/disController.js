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

router.post('/getdiscbyid',authenticate, async(req,res)=>{
    let discs = await Disscusion.find({userid: req.body.userid})

    for (let i = 0; i < discs.length; i++) {
        
        if(discs[i].comments.length != 0)
        {
            for (let j = 0; j < discs[i].comments.length; j++) {
                const element = await Comment.findById({_id: disc[i].comments[j]._id});
                const user = await User.findById({_id: discs[i].comments[j].commentor});
                let result = _.pick(user, ['_id', 'name']);
                discs[i].comments[j].commentor = result;

                if(element.subcomments.length != 0)
                {
                    for (let k = 0; k < element.subcomments.length; k++) {
                        const el = await Comment.findById({_id: element.subcomments[k]._id});
                        element.subcomments[k] = el
                    }  
                }

                disc[i].comments[j] = element
            }
        }
        if(discs[i].users.length != 0)
        {
            for (let k = 0; k <  discs[i].users.length; k++) {
                const el = await User.findById({_id: discs[i].users[k]._id});
                let result = _.pick(el, ['_id', 'name']);
                discs[i].users[k] = result
            }
        }

    }
    res.status(200).send(discs);
})

router.post('/getalldisc', async(req,res)=>{
    let discs = await Disscusion.find({})

    for (let i = 0; i < discs.length; i++) {
        const muser = await User.findById({_id: discs[i].userid});
        console.log(muser);
        
        let result = _.pick(muser, ['_id', 'name']);
        discs[i].userid = result;

        if(discs[i].comments.length != 0)
        {
            for (let j = 0; j < discs[i].comments.length; j++) {
                const element = await Comment.findById({_id: discs[i].comments[j]._id});
                const user = await User.findById({_id: discs[i].comments[j].commentor});
                let result = _.pick(user, ['_id', 'name']);
                discs[i].comments[j].commentor = result;
                if(element.subcomments.length != 0)
                {
                    for (let k = 0; k < element.subcomments.length; k++) {
                        const el = await Comment.findById({_id: element.subcomments[k]._id});
                        element.subcomments[k] = el
                    }  


                }

                discs[i].comments[j] = element
            }
        

        }
        if(discs[i].users.length != 0)
        {
            for (let k = 0; k <  discs[i].users.length; k++) {
                const el = await User.findById({_id: discs[i].users[k]._id});
                let result = _.pick(el, ['_id', 'name']);
                discs[i].users[k] = result
            }
        }
    }
    res.status(200).send(discs);
})

module.exports = router;