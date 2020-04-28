const express = require("express");
const app = express();

const http = require("http");
const server = http.Server(app);

const socketIO = require("socket.io");
const io = socketIO(server);

const port = process.env.PORT || 8080;

io.on("connection", socket => {
  console.log({
    user: socket.id
  });
  socket.on("disconnect", () => {});
  socket.on("sendData", msg => {
    socket.broadcast.in(socket["roomid"]).emit("getData", msg);
  });
  socket.on("uploadDoc", msg => {
    console.log({
      doc: msg
    });
    socket.broadcast.in(socket["roomid"]).emit("DocUploaded", msg);
  });

  socket.on("controlFrom", msg => {
    socket.broadcast.in(socket["roomid"]).emit("controlTo", msg);
    console.log({
      control: msg
    });
  });

  socket.on("join", roomid => {
    console.log({
      joinRoom: roomid
    });
    socket.join(roomid);
    socket["roomid"] = roomid;
  });
});

app.get("/close", (req, resp) => {
  resp.send("Close All ");
  const cnn = Object.values(io.of("/").connected);
  cnn.forEach(c => {
    c.disconnect(true);
  });
});
app.get("/check", (req, resp) => {
  const cnn = Object.values(io.of("/").connected);

  const result = cnn.map(c => `<li> ${c.id} </li>`).join("");
  resp.send(`<ol>${result}</ol>`);
});

server.listen(port, () => {});

app.get("/", (req, resp) => {
  resp.send("DONE");
});
