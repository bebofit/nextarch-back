const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3005;
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const mongoose = require('mongoose');
const { Notification } = require('./models/Notification');
const { User } = require('./models/User');
const { Disscusion } = require('./models/disscusion');
app.use(cors());
app.use(bodyParser.json());

var thinktankController = require('./controllers/thinkTankController');
var adminCrudsController = require('./controllers/adminCruds');
var authAdminController = require('./controllers/authAdminController');
var authUserController = require('./controllers/authUserController');
var userController = require('./controllers/userController');
var disController = require('./controllers/disController');
var commentController = require('./controllers/commentController');

app.use('/thinktank', thinktankController);
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

    io.on('connection', function(socket) {
      //notification types
      socket.on('follow', async data => {
        console.log(data);
        const user = await User.findById({ _id: data.userId });
        const noti = {
          type: 'follow',
          userId: data.userId,
          otherUserId: data.otherUserId,
          title: 'New Follower',
          message: `${user.name} has followed you!`
        };
        const createdNotification = await Notification.create(noti);
        await User.findByIdAndUpdate(
          { _id: data.otherUserId },
          { $push: { notification: createdNotification._id } }
        );
        io.sockets.emit(data.otherUserId, noti);
      });

      socket.on('mention', async data => {
        console.log(data);
        const user = await User.findById({ _id: data.userId });
        const disc = await Disscusion.findById({ _id: data.discId });
        const noti = {
          type: 'mention',
          userId: data.userId,
          discId: data.discId,
          otherUserId: data.otherUserId,
          title: `${user.name} Mentioned You`,
          message: `${user.name} has mentioned you in ${disc.title} Disscusion!`
        };
        const createdNotification = await Notification.create(noti);
        await User.findByIdAndUpdate(
          { _id: data.otherUserId },
          { $push: { notification: createdNotification._id } }
        );
        io.sockets.emit(data.otherUserId, noti);
      });

      //comments io
      socket.on('postComment', data => {
        io.sockets.emit(data.discId, data.commentData);
      });
    });
  });

module.exports = { app };
