const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

//Middlewares
app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));



module.exports = app;