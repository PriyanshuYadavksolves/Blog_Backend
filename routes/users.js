const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const varifyToken = require("../middleware/varifyToken");
const sendFollowNotificationEmail = require("../emailServices/sendFollowNotificationEmail"); // Import the exported function
const Blog = require("../models/Blog");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.put("/follow/:userId", varifyToken, async (req, res) => {
  const followerId = req.userId; // Get ID of the logged-in user (follower)
  const followingId = req.params.userId; // Get ID of the user to follow

  try {
    const follower = await User.findByIdAndUpdate(
      followerId,
      {
        $addToSet: { following: followingId }, // Use $addToSet to avoid duplicates
      },
      { new: true }
    );

    const following = await User.findByIdAndUpdate(
      followingId,
      {
        $addToSet: { followers: followerId }, // Use $addToSet to avoid duplicates
      },
      { new: true }
    );

    if (!follower || !following) {
      return res.status(404).json({ message: "Users not found" });
    }

    const { email } = following._doc; // Retrieve the email of the user being followed
    await sendFollowNotificationEmail(
      email,
      follower.username,
      following.username
    );

    const { password, createdAt, updatedAt, __v, ...others } = follower._doc;

    res.status(200).json(others);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/unfollow/:userId", varifyToken, async (req, res) => {
  const followerId = req.userId; // Get ID of the logged-in user (follower)
  const followingId = req.params.userId; // Get ID of the user to unfollow

  try {
    const follower = await User.findByIdAndUpdate(
      followerId,
      {
        $pull: { following: followingId }, // Use $pull to remove followingId
      },
      { new: true }
    );

    const following = await User.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId }, // Use $pull to remove followerId
    });

    if (!follower || !following) {
      return res.status(404).json({ message: "Users not found" });
    }

    const { password, createdAt, updatedAt, __v, ...others } = follower._doc;

    res.status(200).json(others);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", varifyToken, async (req, res) => {
  // console.log(req.body)
  if (req.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        console.log("user hai");
        // console.log(req.files)
        if (
          req.files === null &&
          req.body.username === "" &&
          req.body.email === "" &&
          req.body.password === ""
        ) {
          res.status(500).json("no new data being sent");
          // console.log("hello")
        } else if (
          req.files === null &&
          (req.body.username !== "" ||
            req.body.email !== "" ||
            req.body.password !== "")
        ) {
          // Only username, email, or password are being updated
          const { username, email, password } = req.body;
          // console.log("hello 2")

          if (username !== user.username) {
            // Update username in related posts
            await Blog.updateMany(
              { username: user.username },
              { username: username }
            );
          }
          const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
              username: username ? username : user.username,
              email: email ? email : user.email,
              password: password
                ? await bcrypt.hash(req.body.password, 10)
                : user.password,
            },
            { new: true }
          );

          const {
            password: pass,
            createdAt,
            updatedAt,
            __v,
            ...others
          } = updatedUser._doc;

          return res.status(200).json(others);
        } else if (
          req.files.image &&
          req.body.username === "" &&
          req.body.email === "" &&
          req.body.password === ""
        ) {
          //only file being updated
          // console.log("ji haaa")
          const file = req.files.image;
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "images",
            resource_type: "auto",
            public_id: `${Date.now()}`,
          });

          const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
              $set: { profilePic: result.secure_url },
            },
            { new: true }
          );
          const {
            password: pass,
            createdAt,
            updatedAt,
            __v,
            ...others
          } = updatedUser._doc;

          return res.status(200).json(others);
        } else {
          // Both image and other fields are being updated
          const file = req.files.image;
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "images",
            resource_type: "auto",
            public_id: `${Date.now()}`,
          });
          const { username, email, password } = req.body;
          const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
              username: username ? username : user.username,
              email: email ? email : user.email,
              password: password
                ? await bcrypt.hash(req.body.password, 10)
                : user.password,
              profilePic: result.secure_url,
            },
            { new: true }
          );
          const {
            password: pass,
            createdAt,
            updatedAt,
            __v,
            ...others
          } = updatedUser._doc;

          return res.status(200).json(others);
        }
      } else {
        return res.status(404).json("User not found");
      }
    } catch (err) {
      return res.status(500).json({ msg: "asdsfd", err });
    }
  } else {
    return res.status(401).json("You can update only your account!");
  }
});

//DELETE
router.delete("/:id", varifyToken, async (req, res) => {
  try {
    // const user = await User.findById(req.params.id);
    try {
      // await Post.deleteMany({ username: user.username });
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(404).json("User not found!");
  }
});

//GET USER
// router.get("/:id",varifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, ...others } = user._doc;
//     res.status(200).json(others);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//REQUEST FOR UPDATED ADMIN REQUEST
router.put("/request/:id", varifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isRequested: true },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
