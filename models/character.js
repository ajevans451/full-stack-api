const mongoose = require('mongoose')
const characterSchema = new mongoose.Schema({
  name: {
    type: String
  },
  race: {
    type: String
  },
  class: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})
module.exports = mongoose.model('Character', characterSchema)
