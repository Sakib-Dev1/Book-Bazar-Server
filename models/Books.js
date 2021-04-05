const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    quantity: {
      type: String,
      required: true,
      default: '1',
    },

    image: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', BookSchema);
