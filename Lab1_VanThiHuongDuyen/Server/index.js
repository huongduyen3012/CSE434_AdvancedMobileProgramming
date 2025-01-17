import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import Messages from "./models/Messages.js"; // Import your Message schema

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017", { dbName: "ChatHistory" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// In-memory user data
let users = [];

// Add a route to check messages in the database
app.get("/messages", async (req, res) => {
  try {
    const messages = await Messages.find().lean();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins a room
  socket.on("join", async ({ username }) => {
    try {
      // Add the user to the specified room
      users.push({ id: socket.id, name: username });

      // Fetch existing messages for the group
      const messages = await Messages.find().lean();

      // Send existing messages to the user
      io.emit("messageHistory", messages);

      // Notify other users in the room
      io.emit("userJoined", {
        message: `${username} has joined the chat.`,
      });

      console.log(`${username} joined room.`);
    } catch (error) {
      console.error("Error in join event:", error.message);
    }
  });

  // Listen for chat messages
  socket.on("chatMessage", async ({ username, message }) => {
    try {
      // Save the message to MongoDB
      const user = users.find((u) => u.id === socket.id);
      // Set isSentByMe to true if the current user sent the message
      const isSentByMe = user && user.name === username;

      const newMessage = new Messages({ username, isSentByMe, message });
      await newMessage.save();

      // Broadcast the message to everyone in the room
      io.emit("receiveMessage", {
        username,
        message,
        _id: newMessage._id,
        isSentByMe,
      });

      console.log(`Message from ${username} in group: ${message}`);
    } catch (error) {
      console.error("Error in chatMessage event:", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const userIndex = users.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const username = users[userIndex].name;
      users.splice(userIndex, 1);
      console.log(`User disconnected: ${socket.id} (${username})`);

      io.emit("userLeft", {
        message: `${username} has left the room.`,
      });
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
