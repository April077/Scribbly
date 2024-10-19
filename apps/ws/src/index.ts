import express from "express";

const app = express();
import http from "http";
const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

type DrawLine = {
  prevPt: Point | null;
  currPt: Point;
  color: string;
};

type Point = { x: number; y: number };


io.on("connection", (socket) => {
  console.log("connected");

  socket.on("draw-line", ({ prevPt, currPt, color }: DrawLine) => {
    socket.broadcast.emit("draw-line", { prevPt, currPt, color });
  });

  socket.on("new-client", () => {
    socket.broadcast.emit("get-state");
  });

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("data-from-server", data);
  });

  socket.on("clear", () => {
    io.emit("clear");
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
