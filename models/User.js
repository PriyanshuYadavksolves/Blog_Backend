const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true,'cant be empty'],
      unique: [true,'Username Already Exist']
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    verificationToken: String,
    verified: {
      type: Boolean,
      required: true,
      default: false
  },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    isAdmin:{
      type:Boolean,
      default:false,
    },
    isSuperAdmin:{
      type:Boolean,
      default:false,
    },
    isRequested:{
      type:Boolean,
      default:false,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Reference the User model for followers
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Reference the User model for following
    }]

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);