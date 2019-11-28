const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3005;
var http = require('http').createServer(app);
const mongoose = require('mongoose');

app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });
app.use(bodyParser.json());

var adminCrudsController = require('./controllers/adminCruds');
var authAdminController = require('./controllers/authAdminController');
var authUserController = require('./controllers/authUserController');
var userController = require('./controllers/userController');
var disController = require('./controllers/disController');
var commentController = require('./controllers/commentController');

app.use('/adminCruds', adminCrudsController);
app.use('/authAdmins', authAdminController);
app.use('/authUsers', authUserController);
app.use('/users', userController);
app.use('/disc', disController);
app.use('/comment', commentController);

mongoose
  .connect(
    `mongodb+srv://nourhany:Nourhany@cluster0-ifrtn.mongodb.net/nextarch-dev?retryWrites=true`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .catch(err => {
    console.log(err);
  })
  .then(() => {
    console.log('Connected to MongoDB');

    http.listen(port, () => {
      console.log(`started on port ${port}`);
    });
  });

module.exports = { app };
