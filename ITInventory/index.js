const express = require("express")
const app = express()
const mongoose = require("mongoose")
const session = require("express-session");
const flash = require("express-flash");

// set the view engine to ejs
app.set("view engine", "ejs")
//static files
app.use(express.static("./public/"))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

const bodyParser = require("body-parser")
app.use(bodyParser.json())

// Add the following middleware for session and flash
app.use(session({ secret: "aakakakakakak", resave: true, saveUninitialized: true }));
app.use(flash());


//DB connection
const databaseUrl = "mongodb+srv://karmatshew471:h6QXvaXjSeI7POos@cluster0.1zc8vyr.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () => {
  console.log("Connected to MongoDB database")
})

//call controller here
app.use("", require("./controllers/backupcontroller"))
app.use("", require("./controllers/reportController"))
app.use("", require("./controllers/assetOutwardController"))
app.use("", require("./controllers/assetInwardController"))
app.use("", require("./controllers/Inventory/inventory"))

app.listen(8080)
console.log("Server is listening on port 8080")
