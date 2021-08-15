/************** CORE MODULES **************/
const path = require("path");

/************** NPM MODULES  **************/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

/************** ROUTE IMPORTS *************/
const userRoutes = require('./routes/feed');

/************** EXPRESS SETUP ************/
const app = express();

/************** PARSER SETUP *************/
app.use(express.json());

/********** STATIC FOLDER SETUP **********/
app.use(express.static(path.join(__dirname, "assets")));

/************* ROUTES SETUP **************/
app.use("/", userRoutes);

/****** EROOR HANDLING MIDDLEWARE  *******/
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data,
  });
});

/******** 404 MIDDLEWARE *********/
app.use((req, res, next) => {
  res.status(404).json({
    message: "resourse not found",
  });
});

/*********** PORT AND DB SETUP **********/
const PORT = 8080;
mongoose
  .connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log("Server started on port: "+PORT);
    });
  })
  .catch((err) => console.log(err));
