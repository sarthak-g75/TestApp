const express = require('express')
const fetchuser = require('../middleware/fetchUser')
const Employee = require('../models/Employee')
const router = express.Router()
const z = require('zod')
// const x = require('../../client/public')
const schema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  mobile: z.number().max(9999999999),
})
const employeeSchema = z.object({
  name: z.string().optional(),
  designation: z.string().optional(),
  mobile: z.number().max(9999999999).optional(),
})
const multer = require('multer')

// Initialize multer middleware with defined storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Set destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${uniqueSuffix}.jpg`) // Set filename with .jpg extension
  },
})

const upload = multer({ storage: storage })
router.post(
  '/create-employee',
  upload.single('image'),
  fetchuser,
  async (req, res) => {
    // console.log(typeof req.body.mobile)
    let success = false
    const { name, email, mobile, designation, gender, course } = req.body
    const imagePath = req.file ? req.file.filename : null // Retrieve uploaded image filename
    const mobileInt = parseInt(mobile)
    try {
      const validate = schema.safeParse({
        mobile: mobileInt,
        email: email,
        name: name,
      })
      console.log(typeof mobileInt)
      if (!validate.success) {
        return res.status(400).json({
          success: success,
          message: JSON.stringify(validate.error.errors),
        })
      }

      const employee = await Employee.findOne({ email: email })
      if (employee || email === req.data.email) {
        return res.status(403).json({
          success: success,
          message: 'Employee with this email already exists.',
        })
      }

      // Create the employee with image path if available
      await Employee.create({
        name,
        email,
        mobile: mobileInt,
        designation,
        gender,
        course,
        date: Date.now(),
        image: imagePath,
      })
      success = true

      return res.status(200).json({
        success: success,
        message: 'Employee added successfully.',
      })
    } catch (error) {
      return res.status(500).json({ success: success, message: error.message })
    }
  }
)

router.get('/get-employee', fetchuser, async (req, res) => {
  let success = false
  try {
    const employee = await Employee.find({})
    // console.log(employee)
    if (employee.length > 0) {
      success = true
      return res.status(200).json({
        success: success,
        message: 'Employee Found ',
        employee: employee,
      })
    }
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})

router.delete('/delete-employee/:employeeId', fetchuser, async (req, res) => {
  let success = false
  try {
    const employeeId = req.params.employeeId
    const employee = await Employee.findByIdAndDelete(employeeId)
    if (employee) {
      success = true
      return res.status(200).json({
        success: success,
        message: 'Employee deleted successfully',
        employee: employee,
      })
    } else {
      return res.status(404).json({
        success: success,
        message: 'Employee not found',
      })
    }
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})

router.put(
  '/edit-employee/:employeeId',
  upload.single('image'),
  fetchuser,
  async (req, res) => {
    let success = false
    try {
      const employeeId = req.params.employeeId
      const { name, designation, mobile, email } = req.body // Include email here
      const mobileInt = parseInt(mobile)
      const validate = employeeSchema.safeParse({
        mobile: mobileInt,
        email: email, // Use email here
        name: name,
      })
      // console.log(req.file)

      let imagePath = req.file ? req.file.filename : null // Retrieve uploaded image filename

      if (validate.success) {
        const updatedEmployee = await Employee.findOneAndUpdate(
          { _id: employeeId },
          { name, designation, mobile: mobileInt, image: imagePath },
          { new: true }
        )

        if (updatedEmployee) {
          success = true
          return res.status(200).json({
            success: success,
            message: 'Employee details updated successfully',
            employee: updatedEmployee,
          })
        } else {
          return res.status(404).json({
            success: success,
            message: 'Employee not found',
          })
        }
      } else {
        return res.status(400).json({
          success: success,
          message: 'Invalid employee data',
          errors: validate.error.errors,
        })
      }
    } catch (error) {
      return res.status(500).json({ success: success, message: error.message })
    }
  }
)

router.get('/get-employee/:emplyeeID', fetchuser, async (req, res) => {
  let success = false
  const id = req.params.emplyeeID
  try {
    const employee = await Employee.findById(id)
    if (employee < 1) {
      return res
        .status(404)
        .json({ success: success, message: 'Employee Not found' })
    }
    success = true
    return res.status(200).json({ success: success, employee: employee })
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})
module.exports = router
