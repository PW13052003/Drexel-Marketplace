const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
const port = 3000;
const hostname = "localhost";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, hostname, () => {
  console.log(`Server listening at http://${hostname}:${port}`);
});