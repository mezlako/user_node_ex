const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Bookmark } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { bookmarkOne, bookmarkTwo, bookmarkThree, insertBookmarks } = require('../fixtures/bookmark.fixture');

setupTestDB();

describe('Bookmark routes', () => {
  describe('POST /v1/bookmarks', () => {
    let newBookmark;

    beforeEach(() => {
      newBookmark = {
        url: faker.internet.url(),
        title: faker.lorem.words(3),
      };
    });

    test('should return 201 and the created bookmark if url and title are provided', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBookmark)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        url: newBookmark.url,
        title: newBookmark.title,
      });
    });

    test('should return 201 and the created bookmark when title is omitted', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ url: newBookmark.url })
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        url: newBookmark.url,
      });
    });

    test('should store the bookmark in the database associated with the caller', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBookmark)
        .expect(httpStatus.CREATED);

      const dbBookmark = await Bookmark.findById(res.body.id);
      expect(dbBookmark).toBeDefined();
      expect(dbBookmark.user.toHexString()).toBe(userOne._id.toHexString());
      expect(dbBookmark.url).toBe(newBookmark.url);
    });

    test('should not expose the user field in the response', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBookmark)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty('user');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).post('/v1/bookmarks').send(newBookmark).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if url is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'no url here' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if url is not a valid URI', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ url: 'not-a-url' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/bookmarks', () => {
    test('should return 200 with only the caller\'s bookmarks', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBookmarks([bookmarkOne, bookmarkTwo, bookmarkThree]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.totalResults).toBe(2);
      expect(res.body.results).toHaveLength(2);
      const ids = res.body.results.map((b) => b.id);
      expect(ids).toContain(bookmarkOne._id.toHexString());
      expect(ids).toContain(bookmarkTwo._id.toHexString());
      expect(ids).not.toContain(bookmarkThree._id.toHexString());
    });

    test('should return 200 with correct pagination envelope', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne, bookmarkTwo]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('should return 200 with empty results when caller has no bookmarks', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(0);
      expect(res.body.totalResults).toBe(0);
    });

    test('should return 200 and respect the limit param', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne, bookmarkTwo]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
    });

    test('should return 200 and respect the page param', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne, bookmarkTwo]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(bookmarkTwo._id.toHexString());
    });

    test('should not expose the user field in results', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne]);

      const res = await request(app)
        .get('/v1/bookmarks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results[0]).not.toHaveProperty('user');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/bookmarks').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/bookmarks/:bookmarkId', () => {
    test('should return 204 and remove the bookmark from the database', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne]);

      await request(app)
        .delete(`/v1/bookmarks/${bookmarkOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbBookmark = await Bookmark.findById(bookmarkOne._id);
      expect(dbBookmark).toBeNull();
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne]);

      await request(app).delete(`/v1/bookmarks/${bookmarkOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user tries to delete another user\'s bookmark', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBookmarks([bookmarkThree]);

      await request(app)
        .delete(`/v1/bookmarks/${bookmarkThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);

      const dbBookmark = await Bookmark.findById(bookmarkThree._id);
      expect(dbBookmark).not.toBeNull();
    });

    test('should return 404 if bookmark does not exist', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/bookmarks/${bookmarkOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 if bookmarkId is not a valid mongo id', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete('/v1/bookmarks/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
