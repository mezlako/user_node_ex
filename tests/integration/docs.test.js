const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');

describe('Docs routes', () => {
  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'production';

      const res = await request(app).get('/v1/docs');

      expect(res.statusCode).toBe(httpStatus.NOT_FOUND);

      process.env.NODE_ENV = originalEnv;
    });

    test('should return redirect when running in development', async () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'development';

      const res = await request(app).get('/v1/docs');

      expect([301, 302]).toContain(res.statusCode);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
