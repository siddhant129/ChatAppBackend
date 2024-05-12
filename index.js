const { log } = require("console");
const express = require("express");
const websocket = require("ws");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const userRouter = require("./Routers/userRouter");
const jwtAuth = require("./midddlewares/jwtAuth");

const errorHandler = require("./midddlewares/error");
const { Socket } = require("dgram");

require("dotenv/config");
const cors = require("cors");

//Cross origin
app.use(cors());
app.options("*", cors());

//JWT Auth
app.use(jwtAuth());

const wss = new websocket.Server({ server: server });

wss.on("connection", function connection(ws, req) {
  console.log(`New client added `);
  console.log(req);
  ws.send(
    JSON.stringify(
      // JSON.stringify(
      {
        server: true,
        message: "Welcome to our chat app :)",
      }
      // )
    )
  );

  ws.on("message", (message) => {
    console.log(`new message from client ${ws} :%s`, message);
    // ws.send(message);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === websocket.OPEN) {
        console.log("Client data");
        client.send(message);
      }
    });
  });
});

//Routes
app.use("/users", userRouter);

app.get("/", (req, res) => {
  // if (req.params.id === "c1") {
  //   clientVar = "client 1";
  // } else if (req.params.id === "c2") {
  //   clientVar = "client 2";
  // }
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
