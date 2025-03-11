import request from 'supertest';
import { MongoClient, Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { app } from '../index';
import { User, UserRole } from '../models/user';
import { Model, Submodel } from '../models/carModel';

dotenv.config();

describe('User Likes API', () => {
  let db: Db;
  let client: MongoClient;
  let testUser: User;
  let testModel: Model;
  let testSubmodel: Submodel;
  let authToken: string;

  beforeAll(async () => {
    // Connect to test database
    const connectionString = process.env.TEST_DB_CONN_STRING || process.env.DB_CONN_STRING || '';
    const dbName = process.env.TEST_DB_NAME || 'bmw_test_db';
    client = new MongoClient(connectionString);
    await client.connect();
    db = client.db(dbName);

    // Clear collections
    await db.collection('users').deleteMany({});
    await db.collection('bmw_models').deleteMany({});

    // Create test user
    testUser = {
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
      likedSubmodels: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await db.collection('users').insertOne(testUser);
    testUser._id = userResult.insertedId;

    // Create test submodel
    testSubmodel = {
      _id: new ObjectId(),
      name: 'Test Submodel',
      engineType: 'V8',
      horsepower: 400,
      torque: 500,
      transmission: 'Automatic',
      year: 2023,
      imageURL: 'https://example.com/image.jpg'
    };

    // Create test model with submodel
    testModel = {
      name: 'Test Model',
      yearIntroduced: 2020,
      yearDiscontinued: 2025,
      description: 'Test description',
      submodels: [testSubmodel],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const modelResult = await db.collection('bmw_models').insertOne(testModel);
    testModel._id = modelResult.insertedId;

    // Create auth token
    authToken = jwt.sign(
      { 
        id: testUser._id?.toString(),
        email: testUser.email,
        role: testUser.role
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await client.close();
  });

  describe('POST /api/v1/users/:id/like', () => {
    it('should like a submodel', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${testUser._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id?.toString(),
          submodelId: testSubmodel._id?.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Submodel liked successfully');

      // Verify user has liked submodel
      const updatedUser = await db.collection('users').findOne({ _id: testUser._id });
      expect(updatedUser?.likedSubmodels).toHaveLength(1);
      expect(updatedUser?.likedSubmodels[0].modelId).toBe(testModel._id?.toString());
      expect(updatedUser?.likedSubmodels[0].submodelId).toBe(testSubmodel._id?.toString());
    });

    it('should not like the same submodel twice', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${testUser._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id?.toString(),
          submodelId: testSubmodel._id?.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('already liked');

      // Verify user still has only one entry
      const updatedUser = await db.collection('users').findOne({ _id: testUser._id });
      expect(updatedUser?.likedSubmodels).toHaveLength(1);
    });
  });

  describe('POST /api/v1/users/:id/unlike', () => {
    it('should unlike a submodel', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${testUser._id}/unlike`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id?.toString(),
          submodelId: testSubmodel._id?.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Submodel unliked successfully');

      // Verify user has unliked submodel
      const updatedUser = await db.collection('users').findOne({ _id: testUser._id });
      expect(updatedUser?.likedSubmodels).toHaveLength(0);
    });

    it('should handle unliking a submodel that was not liked', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${testUser._id}/unlike`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id?.toString(),
          submodelId: testSubmodel._id?.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('was not liked');
    });
  });

  describe('GET /api/v1/users/:id/liked', () => {
    beforeEach(async () => {
      // Like a submodel for testing
      await db.collection('users').updateOne(
        { _id: testUser._id },
        { $set: { likedSubmodels: [{ 
          modelId: testModel._id?.toString(), 
          submodelId: testSubmodel._id?.toString() 
        }] } }
      );
    });

    it('should get liked submodels for a user', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser._id}/liked`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.likedSubmodels).toHaveLength(1);
      expect(response.body.likedSubmodels[0].modelId).toBe(testModel._id?.toString());
      expect(response.body.likedSubmodels[0].submodelId).toBe(testSubmodel._id?.toString());
      expect(response.body.likedSubmodels[0].modelName).toBe(testModel.name);
      expect(response.body.likedSubmodels[0].submodel.name).toBe(testSubmodel.name);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new ObjectId();
      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}/liked`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
