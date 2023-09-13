// import all installed packages 1st
const express = require("express");
const bodyParser = require("body-parser");



const authRoutes = require('./routes/auth_new');
const postRoutes = require('./routes/post_new');
const musicRoutes = require('./routes/music_new');
// const eventRoutes = require('./routes/event');
// const bookRoutes = require('./routes/book');


//db connection import
const db = require("./database/dbConnect");

//initialize express
const app = express();


//env access
require('dotenv/config');



app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.json());




app.get("/", (req, res) => {
  res.send({
    msg: "hi . welcome to crypto app, hello world",
  });
});

app.get("abc", (req, res) => {
  res.send({
    msg: "hi",
  });
});



app.use('/user-auth',authRoutes);
app.use('/post',postRoutes);
app.use('/music',musicRoutes);


app.listen(3000,()=>{console.log('Server listening on:3000')});
// app.listen(5000);
