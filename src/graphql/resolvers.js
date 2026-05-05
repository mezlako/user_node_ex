const httpStatus = require('http-status');
const Joi = require('joi');
const { GraphQLError } = require('graphql');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const bookmarkValidation = require('../validations/bookmark.validation');
const { objectId } = require('../validations/custom.validation');
const { bookmarkService } = require('../services');

const assertAuthenticated = (context) => {
  if (!context.user) {
    throw new GraphQLError('Please authenticate', {
      extensions: { code: 'UNAUTHENTICATED', httpStatus: httpStatus.UNAUTHORIZED },
    });
  }
};

const toBookmarkJson = (doc) => (doc && doc.toJSON ? doc.toJSON() : doc);

module.exports = {
  Bookmark: {
    id: (parent) => {
      if (parent.id) return parent.id;
      return parent._id ? parent._id.toString() : parent._id;
    },
  },

  Query: {
    me: async (parent, args, context) => {
      assertAuthenticated(context);
      return context.user.toJSON();
    },

    bookmarks: async (parent, args, context) => {
      assertAuthenticated(context);
      const options = pick(args, ['limit', 'page']);
      const { error } = bookmarkValidation.getBookmarks.query.validate(options);
      if (error) {
        const errorMessage = error.details.map((d) => d.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
      }
      return bookmarkService.queryBookmarks(context.user.id, options);
    },
  },

  Mutation: {
    createBookmark: async (parent, args, context) => {
      assertAuthenticated(context);
      const { error, value } = bookmarkValidation.createBookmark.body.validate(args.input);
      if (error) {
        const errorMessage = error.details.map((d) => d.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
      }
      const bookmark = await bookmarkService.createBookmark(context.user.id, value);
      return toBookmarkJson(bookmark);
    },

    deleteBookmark: async (parent, args, context) => {
      assertAuthenticated(context);
      const deleteParamsSchema = Joi.object({
        bookmarkId: Joi.string().required().custom(objectId),
      });
      const { error } = deleteParamsSchema.validate({ bookmarkId: args.id });
      if (error) {
        const errorMessage = error.details.map((d) => d.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
      }
      await bookmarkService.deleteBookmarkById(args.id, context.user.id);
      return true;
    },
  },
};
