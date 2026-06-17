const request = require('supertest');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

// This initializes and connects the test database before the tests run
setupTestDB();

describe('Health Check Routes', () => {
    describe('GET /v1/health', () => {
        test('should return 200 and database status Connected', async () => {
            const res = await request(app).get('/v1/health').send();
            expect(res.status).toBe(200);
            expect(res.body.services.database).toBe('Connected');
        });
    });
});