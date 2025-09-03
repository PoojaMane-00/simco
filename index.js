const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const itemRoutes = require("./routes/itemRoutes");
const mainRouter = require("./routes/mainRoutes");
const path = require("path");
require('dotenv').config();

const session = require("express-session");
const flash = require("connect-flash");

const app = express();
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: "yourSecretKey", // use a strong secret in production
    resave: false,
    saveUninitialized: true,
  })
);

// Flash middleware (must come after session)
app.use(flash());

// app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));


//"mongodb+srv://new_user:lJwpMPw25epYqSIj@cluster0.0vgnayc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// app.use('/', itemRoutes);
app.use("/", mainRouter);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SIMCo server running on http://localhost:${PORT}`);
});
