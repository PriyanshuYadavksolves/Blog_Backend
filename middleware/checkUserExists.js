const User = require("../models/User")


const checkUserExists = async(req,res,next) =>{
    try {
        const { email, username } = req.body;
    
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
          return res.status(403).json('Username/Email already exists');
        }
    
        next();
      } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json('Server error');
      }
}

module.exports = checkUserExists