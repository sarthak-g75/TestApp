const mongoose = require('mongoose')
const mongoURI =
  'mongodb+srv://sarthak78:sarthak5@notebook.apkoif4.mongodb.net/testNew'
const connectTOMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log('connected to mongo')
    })
    .catch((err) => console.log(err.message))
}
module.exports = connectTOMongo
