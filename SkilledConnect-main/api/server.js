import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js"
import sevaRoute from "./routes/seva.route.js"
import conversationRoute from "./routes/conversation.route.js"
import messageRoute from "./routes/message.route.js"
import authRoute from "./routes/auth.route.js"
import orderRoute from "./routes/order.route.js"
import reviewRoute from "./routes/review.route.js"
import cors from "cors";
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

dotenv.config();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');
  }
  catch (err) {
    console.log(err);
  }

  app.use("/api/users", userRoute)
  app.use("/api/seva", sevaRoute)
  app.use("/api/conversations", conversationRoute)
  app.use("/api/messages", messageRoute)
  app.use("/api/auth", authRoute)
  app.use("/api/orders", orderRoute)
  app.use("/api/reviews", reviewRoute)

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    // Add more socket event handlers here
  });
}

// app.get('/',(req,res)=>{
//     res.send("Hello from node api.");
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  connect()
  console.log(`Server is running on port ${PORT}`);
});