const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle incoming chat messages
  socket.on("chat message", (msg) => {
    console.log("Message from client:", msg);
    // Broadcast the message to all connected clients
    io.emit("chat message", msg);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server is running on http://localhost:${port}`);
});
