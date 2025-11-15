const pg = require("pg");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const argon2 = require("argon2");
app.use(express.json());
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');


// DM ROOM HELPER
function getDMRoom(userA, userB) {
  const a = Number(userA);
  const b = Number(userB);

  if (isNaN(a) || isNaN(b)) {
    throw new Error("User IDs must be numbers for DM rooms.");
  }

  return a < b ? `dm_${a}_${b}` : `dm_${b}_${a}`;
}

function getRoomId(user1, user2) {
  const sorted = [Number(user1), Number(user2)].sort((a, b) => a - b);
  return `dm_${sorted[0]}_${sorted[1]}`;
}

console.log(getRoomId(5, 10));
console.log(getRoomId(10, 5));
console.log(getRoomId("20", "20"));
console.log(getRoomId(88, 92));

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
const { title } = require("process");
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
      `INSERT INTO posts (user_id, title, post_description, time_posted, price, condition, category, sold,
  sold_to_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, -1)
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
app.use("/Images", express.static(path.join(__dirname, "public/Images")));

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
      image.mv(path.join(__dirname, 'public/Images', filename), (err) => {
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

app.get("/getImages", (req,res) => { // gets the images for the given post id
  let postID = req.query.postID;
  if (!postID) {
    return res.status(400).json({ error: "postID is required" });
  }

  pool.query("SELECT imagepath FROM images WHERE post_id = $1", [postID])
    .then(result => {
      if (result.rows.length === 0) {
        return res.json({ images: []});
      }
      res.json({ images: result.rows });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    });
});

app.get("/search", (req, res) => { // search for posts given filters. Automatically excludes
// the current user's posts. Automatically puts most recent posts first
  let titleText = req.query.titleText;
  let isNew = req.query.isNew;
  let isUsed = req.query.isUsed;
  let minPrice = req.query.minPrice;
  let maxPrice = req.query.maxPrice;
  let isClothing = req.query.isClothing;
  let isElectronics = req.query.isElectronics;
  let isHome = req.query.isHome;
  let isFurniture = req.query.isFurniture;
  let isOther = req.query.isOther;
  let userID = req.query.userID;
// server side price validation
  if(minPrice){
    if(isNaN(minPrice) || minPrice < 0 || !(/^\d+\.\d{0,2}$|^\d+$|^\.\d{0,2}$/.test(minPrice))
    || minPrice > 99999999.99) {
      console.log("invalid minPrice");
      return res.status(400).json({});
    }
  }
  if(maxPrice){
    if(isNaN(maxPrice) || maxPrice < 0 || !(/^\d+\.\d{0,2}$|^\d+$|^\.\d{0,2}$/.test(maxPrice))
    || maxPrice > 99999999.99) {
      console.log("invalid maxPrice");
      return res.status(400).json({});
  }
  }
  if(minPrice && maxPrice){
    if(minPrice > maxPrice) {
    console.log("invalid price range");
    return res.status(400).json({});
  }
  }
  

  const categories = [];
  if (isClothing === "true") categories.push("clothing");
  if (isElectronics === "true") categories.push("electronics");
  if (isHome === "true") categories.push("home");
  if (isFurniture === "true") categories.push("furniture");
  if (isOther === "true") categories.push("other");


  console.log(req.query);
  let params = [`%${titleText}%`];
  let query = "SELECT * FROM posts WHERE ($1::text IS NULL OR title ILIKE $1::text)"; // ILIKE is for case insensitive string matches
  if (isNew === "true" && isUsed !== "true") {
    query += " AND condition = 'new'";
  } else if (isUsed === "true" && isNew !== "true") {
    query += " AND condition = 'used'";
  }

    if (minPrice) {
    query += " AND price >= $" + (params.length + 1);
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND price <= $" + (params.length + 1);
    params.push(maxPrice);
  }
  

  // Do nothing if none or all of the categories are selected (no filtering needed)
  if (categories.length > 0 && categories.length < validCategories.length) {
    query += " AND category = ANY($" + (params.length + 1) + ")"; // Select any of the checked categories
    params.push(categories);
  }
  query += " AND user_id != $" + (params.length + 1);
  params.push(userID);

  query += " ORDER BY time_posted DESC";
  pool.query(query, params).then(result => {
    res.json({ rows: result.rows });
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "server error" });
  });
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

    const hashedPassword = await argon2.hash(password);
    console.log("Other form data:", req.body);
    res.status(200).json({ message: "Password hashed successfully!" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." })
  }
});


// NEW ADDITIONS FOR REVIEWING SELLER
app.post("/purchase", async (req, res) => {
  try {
    const { post_id } = req.body;

    const buyer_id = 1;

    if (!post_id) {
      return res.status(400).json({ message: "post_id is required" });
    }

    const postResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1;",
      [post_id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const seller_id = postResult.rows[0].user_id;

    if (seller_id === buyer_id) {
      return res.status(400).json({ message: "You cannot purchase your own item" });
    }

    const existingPurchase = await pool.query(
      "SELECT id FROM purchases WHERE post_id = $1 AND buyer_id = $2;",
      [post_id, buyer_id]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ message: "You have already purchased this item" });
    }

    await pool.query(
      `INSERT INTO purchases (post_id, buyer_id) VALUES ($1, $2);`,
    )
    return res.status(200).json({ 
      message: "Purchase recorded successfully!",
      post_id,
      buyer_id
    });
  }

  catch (err) {
    console.error("Purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/addReview", async (req, res) => {
  try {
    const { post_id, rating, review_text } = req.body;
    const buyer_id = 1;

    if (!post_id) {
      return res.status(400).json({ message: "post_id is required" });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: "rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const postResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1;",
      [post_id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const seller_id = postResult.rows[0].user_id;

    if (seller_id === buyer_id) {
      return res.status(400).json({ message: "You cannot review your own item" });
    }

    const purchaseCheck = await pool.query(
      "SELECT id FROM purchases WHERE post_id = $1 AND buyer_id = $2;",
      [post_id, buyer_id]
    );

    if (purchaseCheck.rows.length === 0) {
      return res.status(400).json({ message: "You cannot review this item because you have not purchased it" });
    }

    const reviewCheck = await pool.query(
      "SELECT id FROM reviews WHERE post_id = $1 AND buyer_id = $2;",
      [post_id, buyer_id]
    );

    if (reviewCheck.rows.length > 0) {
      return res.status(400).json({ message: "You have already reviewed this item" });
    }

    await pool.query(
      `INSERT INTO reviews (post_id, buyer_id, rating, review_text) VALUES ($1, $2, $3, $4);`,
      [post_id, buyer_id, rating, review_text]
    );

    return res.status(200).json({
      message: "Review added successfully!",
      post_id,
      buyer_id,
      rating,
      review_text,
    });
  }
  
  catch (err) {
    console.error("Review error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/reviews/product/:post_id", async (req, res) => {
  try {
    const { post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({ message: "post_id is required" });
    }

    const result = await pool.query(
      `SELECT r.rating, r.review_text, r.created_at, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.post_id = $1
       ORDER BY r.created_at DESC`,
      [post_id]
    );

    return res.status(200).json({
      post_id,
      reviews: result.rows
    });
  }

  catch (err) {
    console.error("Error fetching product reviews:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/reviews/seller/:seller_id", async (req, res) => {
  try {
    const { seller_id } = req.params;

    if (!seller_id) {
      return res.status(400).json({ message: "seller_id is required" });
    }

    const reviewsResult = await pool.query(
      `SELECT r.rating, r.review_text, r.created_at, u.first_name, u.last_name, p.title AS product_title
       FROM reviews r
       JOIN posts p ON r.post_id = p.id
       JOIN users u ON r.buyer_id = u.id
       WHERE p.user_id = $1
       ORDER BY r.created_at DESC`,
      [seller_id]
    );

    const reviews = reviewsResult.rows;

    // Compute average rating and total reviews
    let avgRating = null;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, row) => acc + row.rating, 0);
      avgRating = (sum / reviews.length).toFixed(2);
    }

    return res.status(200).json({
      seller_id,
      average_rating: avgRating,
      total_reviews: reviews.length,
      reviews
    });
  }

  catch(err) {
    console.error("Error fetching seller reviews:", err);
    return res.status(500).json({ message: "Server error" });
  }
})

app.get("/reviews/eligibility/:post_id/:buyer_id", async (req, res) => {
  try {
    const { post_id, buyer_id } = req.params;

    if (!post_id || !buyer_id) {
      return res.status(400).json({ message: "post_id and buyer_id are required" });
    }

    const postResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [post_id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const seller_id = postResult.rows[0].user_id;

    const isSeller = (parseInt(buyer_id) === seller_id);

    const purchaseResult = await pool.query(
      "SELECT id FROM purchases WHERE post_id = $1 AND buyer_id = $2",
      [post_id, buyer_id]
    );

    const hasPurchased = purchaseResult.rows.length > 0;

    const reviewResult = await pool.query(
      "SELECT id FROM reviews WHERE post_id = $1 AND buyer_id = $2",
      [post_id, buyer_id]
    );

    const alreadyReviewed = reviewResult.rows.length > 0;

    const canReview = hasPurchased && !alreadyReviewed && !isSeller;

    return res.status(200).json({
      post_id,
      buyer_id,
      isSeller,
      hasPurchased,
      alreadyReviewed,
      canReview
    });
  }

  catch(err) {
    console.error("Eligibility check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});