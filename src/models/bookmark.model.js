const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bookmarkSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      private: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.plugin(toJSON);
bookmarkSchema.plugin(paginate);

/**
 * @typedef Bookmark
 */
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
