const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL'],
    default: 'no-photo.jpg'
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters']
  }
}, {
  timestamps: true
});

// Create slug from name
categorySchema.pre('save', function(next) {
    if (this.name) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
