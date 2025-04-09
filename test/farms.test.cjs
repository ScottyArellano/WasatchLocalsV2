require('dotenv').config({ path: './server/.env' });
const request = require('supertest');
const app = require('../server/app');
const mongoose = require('mongoose');
const chai = require('chai');
chai.should();

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

after(async () => {
  await mongoose.connection.close();
});

describe('🌱 Farm API Tests', () => {
  it('✅ should create a farm with valid data', async () => {
    const res = await request(app).post('/api/farms').send({
      name: 'Test Farm API',
      bio: 'A beautiful farm.',
      email: 'api@test.com',
      phone: '555-555-5555',
      website: 'https://testfarm.com',
      products: ['produce', 'eggs'],
      location: {
        type: 'Point',
        coordinates: [-111.1234, 40.5678]
      },
      photos: ['https://placehold.co/600x400']
    });

    res.status.should.equal(201);
    res.body.should.have.property('farm');
    res.body.farm.should.have.property('name', 'Test Farm API');
  });

  it('❌ should reject farm with missing name', async () => {
    const res = await request(app).post('/api/farms').send({
      bio: 'Missing name test.',
      email: 'missing@test.com',
      phone: '000-000-0000',
      website: 'https://fail.com',
      products: ['eggs'],
      location: { type: 'Point', coordinates: [-111, 40] },
      photos: ['https://placehold.co/600x400']
    });

    res.status.should.equal(400);
    res.body.should.have.property('errors');
    res.body.errors[0].msg.should.equal('Name is required');
  });

  it('❌ should reject invalid photo URLs', async () => {
    const res = await request(app).post('/api/farms').send({
      name: 'Bad Photos Farm',
      bio: 'Broken photos',
      email: 'bad@photos.com',
      phone: '1231231234',
      website: 'https://photo.fail',
      products: ['produce'],
      location: { type: 'Point', coordinates: [-111.1, 40.1] },
      photos: [123, null, true]
    });

    res.status.should.equal(400);
    res.body.should.have.property('errors');
    res.body.errors[0].msg.should.equal('Each photo URL must be a valid URL');
  });

  it('❌ should reject missing products array', async () => {
    const res = await request(app).post('/api/farms').send({
      name: 'No Products Farm',
      bio: 'Oops',
      email: 'noproducts@test.com',
      phone: '999-999-9999',
      website: 'https://oops.com',
      location: { type: 'Point', coordinates: [-111.0, 40.0] },
      photos: ['https://placehold.co/400x300']
    });

    res.status.should.equal(400);
    res.body.should.have.property('errors');
    res.body.errors[0].msg.should.equal('Products must be a non-empty array');
  });

  it('❌ should reject farm with invalid coordinates', async () => {
    const res = await request(app).post('/api/farms').send({
      name: 'Invalid Coordinates Farm',
      bio: 'Wrong coordinates',
      email: 'invalid@coordinates.com',
      phone: '999-000-0000',
      website: 'https://invalidcoordinates.com',
      products: ['produce'],
      location: { type: 'Point', coordinates: ['wrong', 'coordinates'] },
      photos: ['https://placehold.co/600x400']
    });

    res.status.should.equal(400);
    res.body.should.have.property('errors');
    res.body.errors[0].msg.should.equal('Coordinates should contain exactly two numeric values.');
  });
});
