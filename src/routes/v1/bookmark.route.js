const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bookmarkValidation = require('../../validations/bookmark.validation');
const bookmarkController = require('../../controllers/bookmark.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(bookmarkValidation.createBookmark), bookmarkController.createBookmark)
  .get(auth(), validate(bookmarkValidation.getBookmarks), bookmarkController.getBookmarks);

router
  .route('/:bookmarkId')
  .delete(auth(), validate(bookmarkValidation.deleteBookmark), bookmarkController.deleteBookmark);

module.exports = router;
