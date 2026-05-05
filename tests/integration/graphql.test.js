const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');
const { bookmarkOne, insertBookmarks } = require('../fixtures/bookmark.fixture');

setupTestDB();

describe('GraphQL /graphql', () => {
  describe('Query me', () => {
    test('should require authentication', async () => {
      const res = await request(app).post('/graphql').send({ query: '{ me { id email } }' }).expect(httpStatus.OK);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    test('should return the current user when authenticated', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ query: '{ me { id email name role isEmailVerified } }' })
        .expect(httpStatus.OK);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.me).toEqual({
        id: userOne._id.toString(),
        email: userOne.email,
        name: userOne.name,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
      });
    });
  });

  describe('Bookmarks', () => {
    test('should list bookmarks for the authenticated user', async () => {
      await insertUsers([userOne]);
      await insertBookmarks([bookmarkOne]);

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          query: `query {
            bookmarks(limit: 10, page: 1) {
              results { id url title }
              page limit totalPages totalResults
            }
          }`,
        })
        .expect(httpStatus.OK);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.bookmarks.totalResults).toBe(1);
      expect(res.body.data.bookmarks.results).toHaveLength(1);
      expect(res.body.data.bookmarks.results[0]).toMatchObject({
        id: bookmarkOne._id.toString(),
        url: bookmarkOne.url,
        title: bookmarkOne.title,
      });
    });

    test('should create and delete a bookmark', async () => {
      await insertUsers([userOne]);

      const url = faker.internet.url();
      const title = faker.lorem.words(2);

      const createRes = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          query: `mutation CreateBookmark($input: CreateBookmarkInput!) {
            createBookmark(input: $input) { id url title }
          }`,
          variables: { input: { url, title } },
        })
        .expect(httpStatus.OK);

      expect(createRes.body.errors).toBeUndefined();
      expect(createRes.body.data.createBookmark).toMatchObject({ url, title });

      const bookmarkId = createRes.body.data.createBookmark.id;

      const deleteRes = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          query: `mutation DeleteBookmark($id: ID!) {
            deleteBookmark(id: $id)
          }`,
          variables: { id: bookmarkId },
        })
        .expect(httpStatus.OK);

      expect(deleteRes.body.errors).toBeUndefined();
      expect(deleteRes.body.data.deleteBookmark).toBe(true);
    });

    test('should reject invalid bookmark ids on delete', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          query: `mutation {
            deleteBookmark(id: "invalid")
          }`,
        })
        .expect(httpStatus.OK);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].extensions.httpStatus).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
