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

function createHandler(name : string){
  socket.on(name , (data) => {
    socket.to(data.room).emit( name, data.message)
  })
}

  socket.on("joinRoom", (data) => {
    socket.join(data);
  });

  socket.on("leaveRoom", (data) => {
    socket.leave(data);
  });

  socket.on('messageNotify' , (data) => {
    const allRooms = io.sockets.adapter.rooms
    const roomName = 'room' + data.message.id
    if (allRooms.has(roomName) && allRooms.has(data.room)){
      const privateRoom = allRooms.get(data.room)
      const chatRoom = allRooms.get(roomName)
      if (!Array.from(privateRoom!).some(element => chatRoom!.has(element))){
        socket.to(data.room).emit('messageNotify' , data.message)
      }
    }
  })
  // createHandler('messageNotify')
  createHandler('message')
  createHandler('newChat')
  createHandler('friendReqNotify')
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
