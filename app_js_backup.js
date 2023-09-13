const express = require('express');
const app = express();

// const con = require('./connection');

// const con = require("./database/dbConnect");
require('dotenv/config');

// For POST-Support
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.send({
    msg: "hi . welcome to crypto app, hello world",
  });
});

const authRoutes = require('./routes/auth_new');
const postRoutes = require('./routes/post');
const musicRoutes = require('./routes/music');
const eventRoutes = require('./routes/event');
const bookRoutes = require('./routes/book');


app.use('/user-auth',authRoutes);
app.use('/post',postRoutes);
app.use('/music',musicRoutes);
app.use('/event',eventRoutes);
app.use('/book',bookRoutes);


app.listen(3000);