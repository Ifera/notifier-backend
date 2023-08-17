const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
