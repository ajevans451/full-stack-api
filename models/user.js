const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  token: String
}, {
  toObject: {
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  },
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
