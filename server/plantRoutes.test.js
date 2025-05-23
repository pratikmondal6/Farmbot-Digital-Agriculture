const request = require('supertest');
const app = require('./index'); // Adjust path if needed
const mongoose = require('mongoose');
const Plant = require('./models/plan.js'); // Adjust path if needed

jest.mock('farmbot', () => ({
  Farmbot: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(),
    moveAbsolute: jest.fn().mockResolvedValue()
  }))
}));

describe('Plant Routes', () => {
  beforeEach(async () => {
    await Plant.deleteMany({ plant_type: 'TestPlant' });
  });

  test('POST /api/plant/save with valid depth', async () => {
    const res = await request(app)
      .post('/api/plant/save')
      .send({ plantType: 'Lettuce', valueType: 'depth', value: -10 });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Saved successfully');
  });

  test('POST /api/plant/save with invalid depth', async () => {
    const res = await request(app)
      .post('/api/plant/save')
      .send({ plantType: 'Lettuce', valueType: 'depth', value: 10 }); // not negative
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Depth must be between 0 mm and -40 mm/);
  });

  test('POST /api/plant/save with missing fields', async () => {
    const res = await request(app)
      .post('/api/plant/save')
      .send({ valueType: 'depth', value: -10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing or invalid fields/);
  });

  test('POST /api/plant/add-type with valid data', async () => {
    const res = await request(app)
      .post('/api/plant/add-type')
      .send({ plant_type: 'TestPlant', minimal_distance: 100, seeding_depth: -10 });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Plant type added successfully');
  });

  test('POST /api/plant/add-type with duplicate plant_type', async () => {
    await request(app)
      .post('/api/plant/add-type')
      .send({ plant_type: 'TestPlant', minimal_distance: 100, seeding_depth: -10 });
    const res = await request(app)
      .post('/api/plant/add-type')
      .send({ plant_type: 'TestPlant', minimal_distance: 100, seeding_depth: -10 });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
  });

  

  test('POST /api/plant/save-depth with valid data', async () => {
    const res = await request(app)
      .post('/api/plant/save-depth')
      .send({ plantType: 'TestPlant', depth: -15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Seeding depth saved');
  });

  test('POST /api/plant/save-depth with invalid depth', async () => {
    const res = await request(app)
      .post('/api/plant/save-depth')
      .send({ plantType: 'TestPlant', depth: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Depth must be a number between 0 mm and -40 mm/);
  });
  test('POST /api/plant/send-depth-to-farmbot with valid depth', async () => {
    const res = await request(app)
      .post('/api/plant/send-depth-to-farmbot')
      .send({ depth: -20 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Depth sent to FarmBot');
  });

  test('POST /api/plant/send-depth-to-farmbot with invalid depth', async () => {
    const res = await request(app)
      .post('/api/plant/send-depth-to-farmbot')
      .send({ depth: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Depth must be a number between 0 mm and -40 mm/);
  });

  
});

afterAll(async () => {
  await mongoose.connection.close();
});