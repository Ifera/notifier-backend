const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

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

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
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

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.apps.length).toBe(3);
      expect(res.body.apps.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.apps.some((a) => a.name === 'egs')).toBeTruthy();
      expect(res.body.apps.some((a) => a.name === 'xyz')).toBeTruthy();
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

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.apps.length).toBe(2);
      expect(res.body.apps.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.apps.some((a) => a.name === 'xyz')).toBeTruthy();
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

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res1.body.apps.length).toBe(2);

      const res2 = await request(server).get(
        '/api/apps/?pageNumber=2&pageSize=2',
      );

      expect(res2.status).toBe(StatusCodes.OK);
      expect(res2.body.apps.length).toBe(1);
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

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.apps.length).toBe(3);
      expect(res.body.apps[0].name).toBe('egs');
      expect(res.body.apps[1].name).toBe('ets');
      expect(res.body.apps[2].name).toBe('xyz');
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

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.apps.length).toBe(2);
      expect(res.body.apps.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.apps.some((a) => a.name === 'egs')).toBeTruthy();
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

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('name', app.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/apps/1');

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no app with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/apps/${id}`);

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    let name;

    const exec = async () => request(server).post('/api/apps').send({ name });

    beforeEach(() => {
      name = 'app';
    });

    it('should return 400 if app name is less than 3 characters', async () => {
      name = 'ap';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if name is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if invalid property is passed in body', async () => {
      const res = await request(server)
        .post('/api/apps')
        .send({ name: 'app', invalid: 'invalid' });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 409 if app with the same name already exists', async () => {
      const app = new Application({ name: 'app' });
      await app.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should save the app if it is valid', async () => {
      const res = await exec();
      const app = await Application.find({ name: 'app' });

      expect(res.status).toBe(StatusCodes.OK);
      expect(app).not.toBeNull();
    });

    it('should return the app if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(StatusCodes.OK);
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

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no app with the given id was found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the app if input is valid', async () => {
      const res = await exec();
      const res2 = await Application.findById(id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });
  });

  describe('PATCH /:id', () => {
    let newName;
    let app;
    let id;

    const exec = async () =>
      request(server).patch(`/api/apps/${id}`).send({ name: newName });

    beforeEach(async () => {
      app = new Application({ name: 'app' });
      await app.save();

      id = app._id;
      newName = 'updatedName';
    });

    it('should return 400 if app name is less than 3 characters', async () => {
      newName = 'ap';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if app name is more than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if app with the given id was not found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update the app if input is valid', async () => {
      const res = await exec();
      const updatedApp = await Application.findById(app.id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(updatedApp.name).toBe(newName);
    });

    it('should return the updated app if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newName);
    });
  });
});
