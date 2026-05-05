const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { bookmarkService } = require('../services');

const createBookmark = catchAsync(async (req, res) => {
  const bookmark = await bookmarkService.createBookmark(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(bookmark);
});

const getBookmarks = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'page']);
  const result = await bookmarkService.queryBookmarks(req.user.id, options);
  res.send(result);
});

const deleteBookmark = catchAsync(async (req, res) => {
  await bookmarkService.deleteBookmarkById(req.params.bookmarkId, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBookmark,
  getBookmarks,
  deleteBookmark,
};
