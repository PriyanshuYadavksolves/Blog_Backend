const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require('express-fileupload')


const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const superAdmin = require("./routes/super");
const commentRoute = require("./routes/comment");
const blogRoute = require("./routes/blog");
const { connectDB } = require("./db/connectDB");

const app = express();


app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200
  })
  );
  app.use(express.json());
  app.use(fileUpload({
    useTempFiles: true,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
  }));

  app.get('/hello',(req,res)=>{
    res.json("hello")
  })

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/super", superAdmin);
app.use("/api/comment", commentRoute);

const main = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(5000, () => {
      console.log("listen on 5000.");
    });
  } catch (error) {
    console.log(error);
  }
};

main();
