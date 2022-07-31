/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { Server, Socket } from 'socket.io';

import * as socketio from "socket.io";
import * as path from "path";

const app = express();

var cors = require('cors');

// "data" comes from front end
// TODO: define type of "data" when we are of the propertion of the "data"
let http = require("http").Server(app);
// http.use(cors());
// set up socket.io and bind it to our
// http server.
// let io = require("socket.io")(http);

const io = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:4200",
		methods: [ "GET", "POST" ]
	}
})


// whenever a user connects on port 3333 via
// a websocket, log that a user has connected
io.on("connection", function(socket: any) {
  console.warn("check a user connected");
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected");

    socket.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("data: ", data);
    io.to(data.userToCall).emit("callUser", { signal: data.signal, from: data.from, name: data.name });
  })

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const port = process.env.port || 3333;
http.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});


// server.on('error', console.error);
