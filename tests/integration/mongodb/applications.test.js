const request = require('supertest');
const mongoose = require('mongoose');
const { Application } = require('../../../models/application');

let server;

describe('/api/apps', () => {
  beforeEach(() => {
    server = require('../../../main');
  });

  afterEach(async () => {
    await server.close();
    await Application.deleteMany({});
  });

  describe('GET /', () => {
    it('should return 400 if invalid query parameters are passed', async () => {
      const res = await request(server).get('/api/apps/?sortBy=id&sortOrder=0');

      expect(res.status).toBe(400);
    });

    it('should return all apps', async () => {
      const apps = [
        new Application({
          name: 'ets',
          description: 'ets app',
          is_active: true,
        }),
        new Application({
          name: 'egs',
          description: 'egs app',
          is_active: true,
        }),
        new Application({
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        }),
      ];

      await Application.collection.insertMany(apps);

      const res = await request(server).get('/api/apps/');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.some((a) => a.name === 'egs')).toBeTruthy();
      expect(res.body.some((a) => a.name === 'xyz')).toBeTruthy();
    });

    it('should return all active apps', async () => {
      const apps = [
        new Application({
          name: 'ets',
          description: 'ets app',
          is_active: true,
        }),
        new Application({
          name: 'egs',
          description: 'egs app',
          is_active: false, // made inactive
        }),
        new Application({
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        }),
      ];

      await Application.collection.insertMany(apps);

      const res = await request(server).get('/api/apps/');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.some((a) => a.name === 'xyz')).toBeTruthy();
    });

    it('should return 2 apps on page 1 and a single app on page 2', async () => {
      const apps = [
        new Application({
          name: 'ets',
          description: 'ets app',
          is_active: true,
        }),
        new Application({
          name: 'egs',
          description: 'egs app',
          is_active: true,
        }),
        new Application({
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        }),
      ];

      await Application.collection.insertMany(apps);

      const res1 = await request(server).get(
        '/api/apps/?pageNumber=1&pageSize=2',
      );

      expect(res1.status).toBe(200);
      expect(res1.body.length).toBe(2);

      const res2 = await request(server).get(
        '/api/apps/?pageNumber=2&pageSize=2',
      );

      expect(res2.status).toBe(200);
      expect(res2.body.length).toBe(1);
    });

    it('should return all apps sorted by their name in ascending order', async () => {
      const apps = [
        new Application({
          name: 'ets',
          description: 'ets app',
          is_active: true,
        }),
        new Application({
          name: 'egs',
          description: 'egs app',
          is_active: true,
        }),
        new Application({
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        }),
      ];

      await Application.collection.insertMany(apps);

      const res = await request(server).get(
        '/api/apps/?sortBy=name&sortOrder=1',
      );

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].name).toBe('egs');
      expect(res.body[1].name).toBe('ets');
      expect(res.body[2].name).toBe('xyz');
    });

    it('should return all apps containing "e" in their name', async () => {
      const apps = [
        new Application({
          name: 'ets',
          description: 'ets app',
          is_active: true,
        }),
        new Application({
          name: 'egs',
          description: 'egs app',
          is_active: true,
        }),
        new Application({
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        }),
      ];

      await Application.collection.insertMany(apps);

      const res = await request(server).get('/api/apps/?like=e');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.some((a) => a.name === 'egs')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return an app if a valid id is passed', async () => {
      const app = new Application({
        name: 'ets',
        description: 'ets app',
        is_active: true,
      });

      await app.save();

      const res = await request(server).get(`/api/apps/${app._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', app.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/apps/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no app with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genres/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    // Define the happy path, and then in each test, we change
    // one parameter that clearly aligns with the name of the
    // test.

    let name;

    const exec = async () => request(server).post('/api/apps').send({ name });

    beforeEach(() => {
      name = 'app';
    });

    it('should return 400 if app name is less than 3 characters', async () => {
      name = 'ap';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if name is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid property is passed in body', async () => {
      const res = await request(server)
        .post('/api/apps')
        .send({ name: 'app', namea: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should save the app if it is valid', async () => {
      await exec();

      const app = await Application.find({ name: 'app' });

      expect(app).not.toBeNull();
    });

    it('should return the app if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'app');
    });
  });

  describe('DELETE /:id', () => {
    let app;
    let id;

    const exec = async () => request(server).delete(`/api/apps/${id}`).send();

    beforeEach(async () => {
      app = new Application({ name: 'app' });
      await app.save();

      id = app._id;
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no app with the given id was found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the app if input is valid', async () => {
      await exec();

      const genreInDb = await Application.findById(id);

      expect(genreInDb).toBeNull();
    });
  });

  describe('PUT /:id', () => {
    let newName;
    let app;
    let id;

    const exec = async () =>
      request(server).put(`/api/apps/${id}`).send({ name: newName });

    beforeEach(async () => {
      app = new Application({ name: 'app' });
      await app.save();

      id = app._id;
      newName = 'updatedName';
    });

    it('should return 400 if app name is less than 3 characters', async () => {
      newName = 'ap';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if app name is more than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if app with the given id was not found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the app if input is valid', async () => {
      await exec();

      const updatedApp = await Application.findById(app.id);

      expect(updatedApp.name).toBe(newName);
    });

    it('should return the updated app if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newName);
    });
  });
});
