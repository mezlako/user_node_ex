const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBookmark = {
  body: Joi.object().keys({
    url: Joi.string().uri().required(),
    title: Joi.string(),
  }),
};

const getBookmarks = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteBookmark = {
  params: Joi.object().keys({
    bookmarkId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBookmark,
  getBookmarks,
  deleteBookmark,
};
