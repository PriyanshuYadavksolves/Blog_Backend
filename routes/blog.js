const router = require("express").Router();
const User = require("../models/User");
const Blog = require("../models/Blog");
const varifyToken = require("../middleware/varifyToken");
const fs = require('fs')

const { S3Client, PutObjectCommand, DeleteObjectCommand  } = require("@aws-sdk/client-s3");
const cheerio = require("cheerio");
const sendNewBlogPostNotification = require("../emailServices/sendNewBlogPostNotification");

const s3Client = new S3Client({
  region: process.env.REGION,  // Replace with your desired region
  credentials: {
    accessKeyId: process.env.ACCESS_KEY, // Access key from environment variable
    secretAccessKey: process.env.SECRET_ACCESS_KEY // Secret key from environment variable
  }
});

//GET ALL BLOG
router.get('/allBlog',varifyToken,async(req,res)=>{
  try {
    const allBlog = await Blog.find({})
    res.status(200).json(allBlog)
  } catch (error) {
    res.status(500).json(error)
  }
})

//GET BLOG
router.get("/blog/:id", varifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Route to like a blog post
router.put("/like/:id",varifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; 

  try {
    const blogPost = await Blog.findById(id);
    if (!blogPost) {
      return res.status(404).json({ message: "Post not found" });
    }

   await blogPost.like(userId);
   const blog = await blogPost.save();

    res.json({ message: "Liked successfully", blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//Create Blog
router.post("/upload-images", varifyToken, async (req, res) => {
  let { username, title, content, userPic } = req.body;

  const coverPic = req.files.coverPic;
    const contentType = coverPic.mimetype;
    const filePath = coverPic.tempFilePath

    // Optional: Generate unique filename
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniqueFilename = `${randomString}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: uniqueFilename,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
      // ACL: 'public-read', // Optional: Make image publicly accessible on S3
    };

    const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
    const s3CoverPic = `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${uniqueFilename}`; // Construct S3 URL
    // console.log(s3CoverPic)

  try {
    const $ = cheerio.load(content);
    const images = $("img");

    for (const i of images) {
      const imageUrl = $(i).attr("src");

      if (imageUrl.startsWith("data:image/")) {
        try {
          // Extract data and content type
          const base64Data = imageUrl.split(",")[1];
          const contentType = imageUrl.split(",")[0].split("/")[1];

          // Generate a unique filename
          const filename = `temp-${Math.random()
            .toString(36)
            .substring(2, 15)}`;

          // Option 1: Upload directly to S3 (avoid temporary files)
          const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: filename, // Use a unique filename
            Body: Buffer.from(base64Data, "base64"),
            ContentType: contentType,
            // ACL: 'public-read', // Make image publicly accessible (optional)
          };

          const command = new PutObjectCommand(uploadParams);
          await s3Client.send(command);
          const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${filename}`; // Construct S3 URL

          // Update image URL with S3 link
          $(i).attr("src", s3Url);
        } catch (error) {
          console.error(`Error uploading image ${imageUrl}:`, error);
          // Handle specific errors (e.g., invalid base64 data)
        }
      } else {
        // Handle external URLs (if needed)
        console.log("not file format");
      }
    }

    const updatedContent = $.html();
    const blog = await Blog.create({
      title,
      htmlContent: updatedContent,
      userId: req.userId,
      username,
      userPic,
      coverPic:s3CoverPic
    });

    const followerEmails = await getFollowerEmails(blog.userId);


    await sendNewBlogPostNotification(blog.title,blog._id,followerEmails,blog.coverPic,blog.userPic,blog.username)

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).send("Error processing images");
  }
});

async function getFollowerEmails(userId) {
  const followers = await User.find({ following: userId });
  return followers.map(follower => follower.email); // Extract email addresses
}


router.patch("/update-images", varifyToken, async (req, res) => {
  try {
    const { id, content } = req.body;

    const blog = await Blog.findById(id);
    const oldContent = blog.htmlContent;

    const $ = cheerio.load(content);
    const newImageUrls = $("img").map((i, element) => $(element).attr("src")).get();

    const $old = cheerio.load(oldContent);
    const oldImageUrls = $old("img").map((i, element) => $(element).attr("src")).get();

    const keepUrls = [];
    const deleteUrls = [];

    for (const oldUrl of oldImageUrls) {
      if (newImageUrls.includes(oldUrl)) {
        keepUrls.push(oldUrl);
      } else {
        deleteUrls.push(oldUrl); // old image need to delete
      }
    }

    // console.log(keepUrls)
    // console.log(deleteUrls)

    const deletePromises = deleteUrls.map(async (imageUrl) => {
      const filename = imageUrl.split("/").pop();
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: filename,
      };
      try {
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        console.log(`Deleted image: ${filename}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    });
    await Promise.all(deletePromises);
    // console.log("hello")

    // const $ = cheerio.load(content);
    const images = $("img");

    for (const i of images) {
      const imageUrl = $(i).attr("src");
      // console.log("hello 5")
    
      if (imageUrl.startsWith("data:image/")) {
        // console.log("hello 6")
        try {
          // Extract data and content type
          const base64Data = imageUrl.split(",")[1];
          const contentType = imageUrl.split(",")[0].split("/")[1];

          // Generate a unique filename
          const filename = `temp-${Math.random()
            .toString(36)
            .substring(2, 15)}`;

          // Option 1: Upload directly to S3 (avoid temporary files)
          const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: filename, // Use a unique filename
            Body: Buffer.from(base64Data, "base64"),
            ContentType: contentType,
            // ACL: 'public-read', // Make image publicly accessible (optional)
          };

          const command = new PutObjectCommand(uploadParams);
          await s3Client.send(command);
          const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${filename}`; // Construct S3 URL

          // Update image URL with S3 link
          $(i).attr("src", s3Url);
        } catch (error) {
          console.error(`Error uploading image ${imageUrl}:`, error);
          // Handle specific errors (e.g., invalid base64 data)
        }
      } else {
        //means this image is already in s3 bucket
        console.log("not file format");
      }
    }
    // console.log("hello 2")
    
    const updatedContent = $.html();
    let { title } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: title, 
        htmlContent: updatedContent
      },
      { new: true }
    );
    res.status(200).json(updatedBlog);

  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).send("Error processing images");
  }
});


router.delete("/delete-images", varifyToken, async (req, res) => {
  const { content, id } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Missing content" });
  }

  const $ = cheerio.load(content);
  const imageUrls = $("img")
    .map((i, element) => $(element).attr("src"))
    .get();

  const deletePromises = imageUrls.map(async (imageUrl) => {
    const filename = imageUrl.split("/").pop();
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: filename,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      console.log(`Deleted image: ${filename}`);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  });

  await Promise.all(deletePromises);

  await Blog.findByIdAndDelete(id);

  res.json({ message: "Image deletion initiated (asynchronous)" });
});

module.exports = router;
