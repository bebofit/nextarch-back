const express = require('express')
const bodyParser = require('body-parser')

const {config} = require('../server/config/config')

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

var userController = require('./controllers/userController')
var merchantController = require('./controllers/MerchantController')
var postController = require('./controllers/postController')
var itemController = require('./controllers/ItemController')

app.use('/users', userController)
app.use('/merchants', merchantController)
app.use('/posts',postController)
app.use('/items',itemController)
app.listen(port, ()=>{
    console.log(`started on port ${port}`);
})

module.exports = {app}