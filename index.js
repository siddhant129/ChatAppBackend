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
  console.log(`New client added `);
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(url);
  var userName = url.searchParams.get("username");

  url.searchParams.forEach((ele, key) => {
    console.log(ele, key);
    if (key == "userName") {
      userName = ele;
    }
  });
  var flag = false;
  if (userName) {
    const userData = await Users.findOne({ userName: userName });

    if (userData) {
      teamUsers.forEach((ele) => {
        console.log(ele);
        if (ele.userName === userName) {
          flag = true;
        }
      });
    }
  }
  if (!flag) {
    teamUsers.add({ userName: userName, ws: ws });
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
        const team = await ChatGroup.findOne({ Name: message.team });
      }
    }
    var allUserNames = new Set();
    users.map((ele) => {
      if (ele.user) {
        allUserNames.add(ele.user.userName);
      }
    });
    console.log(allUserNames);
    teamUsers.forEach((teamUser) => {
      if (allUserNames.has(teamUser.userName)) {
        console.log("Hmm user found");
        if (teamUser.ws !== ws && teamUser.ws.readyState === websocket.OPEN) {
          console.log("Client data");
          teamUser.ws.send(message);
        }
      }
    });
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
