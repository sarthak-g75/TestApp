const jwt = require('jsonwebtoken')
const JWT_SEC = 'sarthak'
const User = require('../models/User')

const fetchuser = async (req, res, next) => {
  const token = req.header('auth-token')

  if (!token) {
    return res
      .status(401)
      .send({ error: 'Plese Authenticate using a valid token' })
  }
  try {
    const data = jwt.verify(token, JWT_SEC)
    const user = await User.findById(data.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    req.data = data

    next()
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = fetchuser
