const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const authRoutes = require('./routes/auth.routes');

//Middlewares
app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));


//Routes
app.use('/api/auth', authRoutes);



module.exports = app;