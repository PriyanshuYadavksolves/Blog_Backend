const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const varifyToken = require('../middleware/varifyToken')

//GET ALL COMMENT OF A BLOG
router.get("/getComment/:id",varifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.find({ blogId: id });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json(error);
  }
});
-
//POST A COMMENT WITH CONTENT BLOGID USERID USERNAME
router.post("/createComment/",varifyToken ,async (req, res) => {
  try {
    const { content, blogId, userId, username, userPic } = req.body;
    const comment = await Comment.create({
      content,
      username,
      blogId,
      userId,
      userPic,
    });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json(error);
  }
});

//UPDATE COMMENT 
router.patch('/updateComment/:id',varifyToken,async(req,res)=>{
  try {
    const {id} = req.params
    const {content} = req.body
    const comment = await Comment.findByIdAndUpdate(id,{
      content:content
    },{new:true})
    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json(error)
  }
})

//DELETE COMMENT IF YOU ARE OWNER
router.delete("/deleteComment/:id",varifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    res.status(200).json("deleted successfully");
  } catch (error) {
    res.status(200).json(error);
  }
});
module.exports = router;
