const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const zod = require('zod')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchUser')
const JWT_SEC = 'sarthak'
const schema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(5),
})

//  API to create an admin which can be done only through postman or any other api testing tool
router.post('/createAdmin', async (req, res) => {
  let success = false
  const { name, email, password } = req.body
  try {
    const validate = schema.safeParse(req.body)
    if (!validate.success) {
      //   console.log(validate.error)
      return res.status(400).json({
        success: success,
        message: 'Not a valid email or the password is small ',
      })
    }
    let user = await User.find({ email: email })
    if (user.length > 0) {
      //   console.log(user)
      return res.status(403).json({
        success: success,
        message: 'Admin with this user already exists',
      })
    }
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(password, salt)
    user = await User.create({
      name: name,
      password: secPass,
      email: email,
    })
    const authToken = jwt.sign(
      { id: user.id, email: email, name: name },
      JWT_SEC
    )
    success = true
    return res.status(200).json({
      success: success,
      message: 'User created Successfully',
      token: authToken,
    })
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})

// API to Login
router.post('/login', async (req, res) => {
  let success = false
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      return res
        .status(404)
        .json({ success: success, message: 'User not found' })
    }
    const comparePass = await bcrypt.compare(password, user.password)
    if (!comparePass) {
      return res.status(400).json({
        success: success,
        message: 'Please try to login with correct credentials',
      })
    }
    const authToken = jwt.sign(
      { id: user.id, email: email, name: user.name },
      JWT_SEC
    )
    success = true
    return res
      .status(200)
      .json({ success: success, message: 'Authorized', token: authToken })
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})

router.get('/get-admin', fetchuser, async (req, res) => {
  return res.status(200).json({ data: req.data })
})
module.exports = router
