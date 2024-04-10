const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const checkUserExists = require('../middleware/checkUserExists')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const verificationEmail = require('../emailServices/verificationEmail')
const transporter = nodemailer.createTransport({
  host:process.env.SMTP_HOST,
  port:process.env.SMTP_PORT,
  secure:true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//Register
router.post("/register",checkUserExists, async (req, res) => {
  
  const {username,password,email,profilePic} = req.body
  console.log(req.body)

  try {

    console.log("hello")

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(40).toString('hex');
    console.log("hello")

    // const user = await User.create({
    //   username,
    //   email,
    //   password: hashedPass,
    //   profilePic: profilePic,
    //   verificationToken,
    // });

    const url = `http://localhost:3000/verify/${verificationToken}`;
    const verificationEmailContent = verificationEmail({ username ,url });

    console.log("hello")
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Tridium's Blog Account Verification",
        html: verificationEmailContent,
      },
      (err, res) => {
        if (err) {
          console.log(err);
          // return res.json({message:"Service unavailable"})
        } else {
          console.log("msg sent");
        }
      }
    );
    return res.status(201).json({
      message: `Sent a verification email to ${email}`,
    });
  } catch (err) {
    res.status(500).json(err);
  }
})


router.post('/verify',async(req,res)=>{
  try {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });

    if(!user){
      return res.status(404).json({message:"User Not Found"})
    }

    if(user.verificationToken !== verificationToken){
      return res.status(404).json({message:"Token is Not Correct"})
    }

    user.verified = true
    user.verificationToken = ""
    await user.save()

    res.status(200).json({message:"Email Verified"})    
  } catch (error) {
    res.status(503).json(error)
  }
})


//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).json("wrong credentials!");
      return;
    }

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) {
      res.status(400).json("wrong credentials!");
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '3d' });

    const { password,createdAt,updatedAt,__v, ...others } = user._doc;
    res.status(200).json({others,token});
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
