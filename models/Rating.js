const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    dentist: {
      type: mongoose.Schema.ObjectId,
      ref: 'Dentist',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ป้องกัน 1 user ให้ rating ทันตแพทย์คนเดียวกันได้ครั้งเดียว
RatingSchema.index({ dentist: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
