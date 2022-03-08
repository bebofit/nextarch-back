const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const mongoose = require("mongoose");
const { Notification } = require("./models/Notification");
const { User } = require("./models/User");
const { Disscusion } = require("./models/disscusion");
app.use(
  cors()
);
app.use(bodyParser.json());

var adminCrudsController = require("./controllers/admin/adminCruds");
var authAdminController = require("./controllers/auth/authAdminController");
var authUserController = require("./controllers/auth/authUserController");
var commentController = require("./controllers/discussion/commentController");
var discussionController = require("./controllers/discussion/discussionController");
var thinktankController = require("./controllers/discussion/thinkTankController");
var userController = require("./controllers/user/userController");

app.use("/adminCruds", adminCrudsController);
app.use("/authAdmins", authAdminController);
app.use("/authUsers", authUserController);
app.use("/comment", commentController);
app.use("/disc", discussionController);
app.use("/thinktank", thinktankController);
app.use("/users", userController);

const devDB = `mongodb+srv://general-user:PDFLAg6A4ynwuRix@cluster0.ifrtn.mongodb.net/nextarch-dev?retryWrites=true&w=majority`;
const prodDB = `mongodb+srv://general-user:PDFLAg6A4ynwuRix@cluster0.ifrtn.mongodb.net/nextarch?retryWrites=true&w=majority`;

mongoose
  .connect(devDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .then(() => {
    console.log("Connected to MongoDB");

    http.listen(port, () => {
      console.log(`started on port ${port}`);
    });

    io.on("connection", function (socket) {
      //notification types
      socket.on("follow", async (data) => {
        const user = await User.findById({ _id: data.userId });
        const noti = {
          type: "follow",
          userId: data.userId,
          otherUserId: data.otherUserId,
          title: "New Follower",
          message: `${user.name} has followed you!`,
        };
        const createdNotification = await Notification.create(noti);
        await User.findByIdAndUpdate(
          { _id: data.otherUserId },
          { $push: { notification: createdNotification._id } }
        );
        io.sockets.emit(data.otherUserId, noti);
      });

      socket.on("mention", async (data) => {
        const user = await User.findById({ _id: data.userId });
        const disc = await Disscusion.findById({ _id: data.discId });
        const noti = {
          type: "mention",
          userId: data.userId,
          discId: data.discId,
          otherUserId: data.otherUserId,
          title: `${user.name} Mentioned You`,
          message: `${user.name} has mentioned you in ${disc.title} Disscusion!`,
        };
        const createdNotification = await Notification.create(noti);
        await User.findByIdAndUpdate(
          { _id: data.otherUserId },
          { $push: { notification: createdNotification._id } }
        );
        io.sockets.emit(data.otherUserId, noti);
      });

      //comments io
      socket.on("postComment", (data) => {
        io.sockets.emit(data.discId, data.commentData);
      });
    });
  });

module.exports = { app };
