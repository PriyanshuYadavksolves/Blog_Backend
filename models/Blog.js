const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    userId: { type: String, required: true }, // Store user IDs who liked the post
    username: {
      type: String,
      require: true,
    },
    userPic:{
      type:String,
      require:true,
  },
  likes: {
    type: [String], // Array of user IDs who liked the post
    default: [],
  },
  coverPic : {
    type:String,
    require:true,
  },
  },
  { timestamps: true }
);

// Add a custom method to like a blog post
blogPostSchema.methods.like = async function (userId) {
  if (this.likes.includes(userId)) {
    // User already liked the post, remove their like
    this.likes = this.likes.filter((id) => id !== userId);
  } else {
    // User hasn't liked the post yet, add their like
    this.likes.push(userId);
  }
  await this.save(); // Save the updated document
};


module.exports = mongoose.model("BlogPost", blogPostSchema);
