const httpStatus = require('http-status');
const { Bookmark } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a bookmark for a user
 * @param {ObjectId} userId
 * @param {Object} body
 * @returns {Promise<Bookmark>}
 */
const createBookmark = async (userId, body) => {
  return Bookmark.create({ ...body, user: userId });
};

/**
 * Query bookmarks for a user
 * @param {ObjectId} userId
 * @param {Object} options - Query options
 * @param {number} [options.limit]
 * @param {number} [options.page]
 * @returns {Promise<QueryResult>}
 */
const queryBookmarks = async (userId, options) => {
  return Bookmark.paginate({ user: userId }, options);
};

/**
 * Delete a bookmark by id
 * @param {ObjectId} bookmarkId
 * @param {string} userId
 * @returns {Promise}
 */
const deleteBookmarkById = async (bookmarkId, userId) => {
  const bookmark = await Bookmark.findById(bookmarkId);
  if (!bookmark) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bookmark not found');
  }
  if (bookmark.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await bookmark.remove();
};

module.exports = {
  createBookmark,
  queryBookmarks,
  deleteBookmarkById,
};
