const pg = require("pg");
const express = require("express");
const app = express();
app.use(express.json());

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.post("/createPost", (req, res)=> {
  let title = "";
  let description = "";
  let userID = 1; /* This is a placeholder until we set up authentication */
  let date = "";
  console.log("Request received:", req.body)
  /* Server-side validation */
  if (
    req.body.hasOwnProperty("title") && 
    req.body.hasOwnProperty("description") &&
    req.body.hasOwnProperty("userID") &&
    req.body.hasOwnProperty("date")
  ) {
    title = req.body.title;
    description = req.body.description;
    date = req.body.date;
    let dateObj = new Date(date);
    if(isNaN(dateObj.getTime())){
        console.log("invalid date/time");
        return res.status(400).json({});
    }

    if(title.length < 1 || title.length > 20){
      console.log("title not appropriate length");
      return res.status(400).json({});
    }
    if(description.length > 500 ){
      console.log("description too long");
      return res.status(400).json({});
    }

    pool.query("INSERT INTO posts (user_id, title, post_desription, time_posted) VALUES ($1, $2, $3, $4)",
      [userID, title, description, date]);
    return res.status(200).json({});
  }
  console.log("Missing title, description, date, or userID");
  return res.status(400).json({});
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});