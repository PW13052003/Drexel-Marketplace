const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pool = require("../app/db");
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/history/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      "SELECT sender, message, timestamp FROM messages WHERE room_id = $1 ORDER BY timestamp ASC",
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Server error fetching messages");
  }
});


io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // When someone sends a message
  socket.on("chat message", async ({ roomId, message, sender }) => {
    console.log(`Message in ${roomId} from ${sender}: ${message}`);

    // Save to database
    try {
      await pool.query(
        "INSERT INTO messages (room_id, sender, message) VALUES ($1, $2, $3)",
        [roomId, sender, message]
      );
    } catch (err) {
      console.error("Error saving message:", err);
    }

    // Send message to all users in the same room
    io.to(roomId).emit("chat message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Private chat server running at http://localhost:3000");
});
