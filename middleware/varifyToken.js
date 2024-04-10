const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  // console.log("varify me "+token)

  if (!token) {
    console.log("token fail ho gya")
    return res.status(401).json({ message: 'Unauthorized in varify' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
