import express from "express";
import { Server } from "socket.io";
import * as http from "http";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("joinRoom", (data) => {
    socket.join(data);
  });

  socket.on("leaveRoom", (data) => {
    socket.leave(data);
  });

  socket.on("message", (data) => {
    socket.to(data.room).emit("message", data.message);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
