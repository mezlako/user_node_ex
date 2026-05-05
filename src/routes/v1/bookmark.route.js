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

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: Bookmark management
 */

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Create a bookmark
 *     description: Creates a bookmark owned by the authenticated user.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *             example:
 *               url: https://example.com
 *               title: Example Site
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bookmark'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: List the current user's bookmarks
 *     description: Returns a paginated list of bookmarks belonging to the authenticated user.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of bookmarks per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bookmark'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 3
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /bookmarks/{bookmarkId}:
 *   delete:
 *     summary: Delete a bookmark
 *     description: Deletes the bookmark. Returns 403 if the bookmark belongs to a different user.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookmarkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
