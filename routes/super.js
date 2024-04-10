const router = require('express').Router()
const User = require('../models/User')
const varifyToken = require('../middleware/varifyToken')


//GET ALL Users
router.post("/getUsers",varifyToken, async (req, res) => {
    try {
      const {id} = req.body
      const user = await User.findById(id)
      if(!user.isSuperAdmin){
          res.status(404).json("You Are Not SuperAdmin")
          return
      }
        const pageNumber = parseInt(req.query.pageNumber) || 0;
        const limit = 5;
        const result = {}
        const totalPosts = await User.countDocuments()
        let startIndex = pageNumber * limit;
        const endIndex = (pageNumber + 1) * limit;
        result.totalPosts = totalPosts
        if(startIndex > 0){
          result.previous = {
            pageNumber : pageNumber - 1,
            limit : limit,
          }
        }
        if(endIndex < (await User.countDocuments())){
          result.next = {
            pageNumber:pageNumber+1,
            limit:limit,
          }
        }
        result.data = await User.find().sort('_id').skip(startIndex).limit(limit)
      result.rowsPerPage = limit;
      return res.status(200).json(result)
    } catch (err) {
      res.status(500).json(err);
    }
  });

router.put('/:id',varifyToken,async(req,res)=>{
    try {
        const {id} = req.params
        const {isAdmin} = req.body
        const updatedUser = await User.findByIdAndUpdate(id,{isAdmin:!isAdmin})
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log(error)
    }
})

// router.post('/allUser',async(req,res)=>{
//     try {
//         const {id} = req.body
//         const user = await User.findById(id)
//         if(!user.isSuperAdmin){
//             res.status(404).json("You Are Not SuperAdmin")
//             return
//         }
//         const allUser = await User.find({})
//         res.status(200).json(allUser)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// })

router.get('/:id',varifyToken,async(req,res)=>{
    try {
        const {id} = req.params   
        const user = await User.findById(id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.delete('/:id',varifyToken,async(req,res)=>{
    try {
        const {id} = req.params   
        const user = await User.findByIdAndDelete(id)
        res.status(200).json("data delete successfully")
    } catch (error) {
        res.status(500).json(error)
    }
})



module.exports = router;


