const mongoose = require('mongoose')

const RegisterSchema = mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Register", RegisterSchema);