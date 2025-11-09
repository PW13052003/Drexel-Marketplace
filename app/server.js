const pg = require("pg");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const argon2 = require("argon2");
app.use(express.json());
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');

// Needed for uploading images to publoc/Images
app.use(fileUpload({
    createParentPath: true
}));
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});


const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);


app.use(express.static("public"));

let validCategories = ["clothing", "electronics", "home", "furniture", "other"];
let conditionOptions = ["new", "used"];
// TODO: make sure the user is logged in somehow
app.post("/createPost", (req, res)=> {
  let title = "";
  let description = "";
  let userID = 1; /* This is a placeholder until we set up authentication */
  let date = "";
  let price = -1;
  let condition = "";
  let category = "";
  console.log("Request received:", req.body)
  /* Server-side validation */
  if (
    req.body.hasOwnProperty("title") && 
    req.body.hasOwnProperty("description") &&
    req.body.hasOwnProperty("userID") &&
    req.body.hasOwnProperty("date") &&
    req.body.hasOwnProperty("price") &&
    req.body.hasOwnProperty("condition") &&
    req.body.hasOwnProperty("category")
  ) {
    title = req.body.title;
    description = req.body.description;
    date = req.body.date;
    price = req.body.price;
    condition = req.body.condition;
    category = req.body.category;

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
    // make sure price is a number >= 0 in correct price format (using regex)
    if(isNaN(price) || price < 0 || !(/^\d+\.\d{0,2}$|^\d+$|^\.\d{0,2}$/.test(price))
    || price > 99999999.99) {
      console.log("invalid price");
      return res.status(400).json({});
    }
    // Note: Postgresql will add decimals to the end of an integer (ex: 1 becomes 1.00)
    // It will also add trailing 0's (ex: 0.1 becomes 0.10)
    // And it will add leading 0's (ex: .50 becomes 0.50)
    // Will also remove leading 0's that are not needed (ex: 0011 becomes 11.00)

    if(!validCategories.includes(category)){
      console.log("not a valid category");
      return res.status(400).json({});
    }

    if(!conditionOptions.includes(condition)) {
      console.log("not a valid condition");
      return res.status(400).json({});
    }

    pool.query(
      `INSERT INTO posts (user_id, title, post_desription, time_posted, price, condition, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [userID, title, description, date, price, condition, category],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        console.log("Inserted post:", result.rows[0]);
        // return the post id so we can add images to the database with this post id
        return res.status(200).json({ postID: result.rows[0].id });
      }
    );
     
  }else{
    console.log("Missing a required field");
    return res.status(400).json({});
  }
  
});

app.post('/addImages', (req, res)=> {
  if (
    req.body.hasOwnProperty("postID") && 
    req.body.hasOwnProperty("paths")
  ) {
    let postID = req.body.postID;
    let paths = req.body.paths;
    for(let path of paths) {
      pool.query(`INSERT INTO images (post_id, imagePath)
        VALUES($1, $2)`,
      [postID, path]);
    }
    return res.status(200).json({});
  }else{
    console.log("Missing a required field");
    return res.status(400).json({});
  }
});

app.post('/uploadImages', (req, res) => {
    let images = req.files.images;
    let uploadedImages = [];
    // If there is no image, exit
    if (!images) {return res.sendStatus(400); }
    // If there is only one image, make sure it is in an array
    if (!Array.isArray(images)) {
      images = [images];
    }
    for(let image of images){
      if (!/^image/.test(image.mimetype)) return res.sendStatus(400);
       const ext = path.extname(image.name); // get the file extension

      // generate a unique name for the image being saved + the file extension
      const filename = uuidv4() + ext; 
      // move the uploaded image to images folder
      image.mv(path.join(__dirname, 'Images', filename), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to save image');
        }
      });
      uploadedImages.push(`/Images/${filename}`);
    }
     
    // send the image paths back so we can put them in the database
    res.json({uploadedImages});
});

app.post("/register", async (req, res) => {
  try {
    const { studentId, firstName, lastName, email, phone, password } = req.body;

    if (!email.endsWith("@drexel.edu")) {
      return res.status(400).json({ message: "Invalid email address. Please use your Drexel email." })
    }
    if (!/^\d{8}$/.test(studentId)) {
      return res.status(400).json({ message: "Invalid student ID. Please enter your Drexel Student ID." });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: "Password cannot be less than 4 characters." });
    }

    // NEW CHANGES - HASHING FEATURE

    const hashedPassword = await argon2.hash(password);
    console.log("Other form data:", req.body);
    res.status(200).json({ message: "Password hashed successfully!" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." })
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});