const { log } = require("console");
const express = require("express");
const websocket = require("ws");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");

//Importing routes
const userRouter = require("./Routers/userRouter");
const chatGrpRouter = require("./Routers/chatGroupRouter");
const jwtAuth = require("./midddlewares/jwtAuth");

const errorHandler = require("./midddlewares/error");
const { Socket } = require("dgram");

require("dotenv/config");
const cors = require("cors");
const { Users } = require("./Models/users");
const { ChatGroup } = require("./Models/ChatGroup");

//Cross origin
app.use(cors());
app.options("*", cors());

//JWT Auth
app.use(jwtAuth());

//Json parser
app.use(express.json());

const wss = new websocket.Server({ server: server });

var teamUsers = new Set();

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  var userName = url.searchParams.get("username");

  url.searchParams.forEach((ele, key) => {
    if (key == "userName") {
      userName = ele;
    }
  });
  var flag = false;
  if (userName) {
    const userData = await Users.findOne({ userName: userName });

    if (userData) {
      teamUsers.forEach((ele) => {
        if (ele.userName === userName) {
          flag = true;
        }
      });
    }
  }
  if (!flag) {
    teamUsers.add({ userName: userName, ws: ws });
    console.log(`${userName} logged in`);
  }

  ws.send(
    JSON.stringify({
      server: true,
      message: "Welcome to our chat app :)",
    })
  );

  ws.on("message", async (message) => {
    console.log(`new message from client ${ws} :%s`, message);
    var users = [];
    try {
      const newMsg = JSON.parse(message);

      if (newMsg.team) {
        const team = await ChatGroup.findOne({ Name: newMsg.team })
          .populate({
            path: "users",
            populate: {
              path: "user",
            },
          })
          .then((grp) => {
            users = grp.users;
          });
      }
    } catch (error) {
      if (message.team) {
        const team = await ChatGroup.findOne({ Name: message.team })
          .populate({
            path: "users",
            populate: {
              path: "user",
            },
          })
          .then((grp) => {
            users = grp.users;
          });
      }
    }
    var allUserNames = new Set();
    users.map((ele) => {
      if (ele.user) {
        allUserNames.add(ele.user.userName);
      }
    });
    teamUsers.forEach((teamUser) => {
      if (allUserNames.has(teamUser.userName)) {
        if (teamUser.ws !== ws && teamUser.ws.readyState === websocket.OPEN) {
          teamUser.ws.send(message);
        }
      }
    });
  });

  ws.on("close", () => {
    const obj = [...teamUsers].find((obj) => obj.userName === userName);
    teamUsers.delete(obj);
    console.log(`${userName} logged out`);
  });
});

//Routes
app.use("/users", userRouter);
app.use("/chatGrp", chatGrpRouter);

app.get("/", (req, res) => {
  Socket.send("NO authetication found");
  res.send("Welcome to websockets ");
});

//Error handler
app.use(errorHandler);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "ToDoListDB",
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

server.listen(5000, () => {
  console.log("listening to server http://localhost:5000");
});
