const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 3005;
var http = require('http').createServer(app);
const mongoose = require('mongoose');

app.use(bodyParser.json());

var userController = require('./controllers/userController')

app.use('/users', userController)

mongoose.connect(
    `mongodb+srv://nourhany:Nourhany@cluster0-ifrtn.mongodb.net/nextarch?retryWrites=true`, { useNewUrlParser: true, useUnifiedTopology: true }
  ).catch(err => {
    console.log(err);
  }).then(() => {
    console.log("Connected to MongoDB");

    http.listen(port, () => {
      console.log(`started on port ${port}`);
    });
  
  });

module.exports = {app}