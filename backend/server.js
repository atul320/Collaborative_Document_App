require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const { errorHandler, notFound } = require('./middleware/error');
const { socketAuthenticate } = require('./middleware/auth');

// Initialize app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // your frontend dev server
  'http://localhost:3000',
  'http://localhost:5000', 
  // any other allowed origin
  // add others here if needed
];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes - prefix all routes with /api
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);


// Error handling
app.use(notFound);
app.use(errorHandler);

// Modify the socket connection handler
// Socket.IO setup
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 🔄 PUBLIC chat socket logic
io.on('connection', (socket) => {
  console.log('User connected to public chat');

  socket.on('sendMessage', (message) => {
    // Basic format check
    if (!message.sender || !message.content) return;
    io.emit('messageBroadcast', message); // Broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));