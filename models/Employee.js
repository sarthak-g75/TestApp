const mongoose = require('mongoose')
const { Schema } = mongoose
const EmployeeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    requried: true,
    unique: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  designation: {
    type: String,
    default: 'HR',
  },
  gender: {
    type: String,
    required: true,
    // default: 'M',
  },
  course: {
    type: [String],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
})
const Employee = mongoose.model('employee', EmployeeSchema)
module.exports = Employee
