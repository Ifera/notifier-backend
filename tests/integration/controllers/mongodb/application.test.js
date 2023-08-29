const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const mongoose = require('mongoose');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { NotificationType } = require('../../../../models/notificationtype');

let server;

describe('/api/apps', () => {
  beforeEach(() => {
    server = require('../../../../main');
  });

  afterEach(async () => {
    await server.close();
    await Application.deleteMany({});
  });

  describe('GET /', () => {
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

    it('should return 409 if app with the same name already exists', async () => {
      const app = new Application({ name: 'app' });
      await app.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should save the app if request is valid', async () => {
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

    afterEach(async () => {
      await Event.deleteMany({});
      await NotificationType.deleteMany({});
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

    it('should delete the app', async () => {
      const res = await exec();
      const res2 = await Application.findById(id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });

    it('should delete the app and its associated event(s)', async () => {
      const events = [
        new Event({
          name: 'event1',
          description: 'event1',
          is_active: true,
          application: id,
        }),
        new Event({
          name: 'event2',
          description: 'event2',
          is_active: true,
          application: id,
        }),
      ];

      await Event.collection.insertMany(events);

      const res1 = await exec();
      const res2 = await Application.findById(id);
      const res3 = await Event.find({ application: id });

      expect(res1.status).toBe(StatusCodes.OK);

      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();

      expect(res3.length).toBe(2);
      expect(res3[0].is_deleted).toBeTruthy();
      expect(res3[0].is_active).toBeFalsy();
      expect(res3[1].is_deleted).toBeTruthy();
      expect(res3[1].is_active).toBeFalsy();
    });

    it('should delete the app and its associated notification-type(s)', async () => {
      const ev = new Event({
        name: 'event1',
        description: 'event1',
        is_active: true,
        application: id,
      });

      const event = await ev.save();

      const notificationTypes = [
        new NotificationType({
          name: 'notificationType1',
          description: 'notificationType1',
          is_active: true,
          event: event._id,
        }),
        new NotificationType({
          name: 'notificationType2',
          description: 'notificationType2',
          is_active: true,
          event: event._id,
        }),
      ];

      await NotificationType.collection.insertMany(notificationTypes);

      const res1 = await exec();
      const res2 = await Application.findById(id);
      const res3 = await Event.findById(event._id);
      const res4 = await NotificationType.find({ event: event._id });

      expect(res1.status).toBe(StatusCodes.OK);

      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();

      expect(res3.is_deleted).toBeTruthy();
      expect(res3.is_active).toBeFalsy();

      expect(res4.length).toBe(2);
      expect(res4[0].is_deleted).toBeTruthy();
      expect(res4[0].is_active).toBeFalsy();
      expect(res4[1].is_deleted).toBeTruthy();
      expect(res4[1].is_active).toBeFalsy();
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

    it('should update the modified date on successful update', async () => {
      const oldDate = app.modified_at;
      const res = await exec();
      const newDate = res.body.modified_at;

      expect(res.status).toBe(StatusCodes.OK);
      expect(newDate).not.toBe(oldDate);
    });
  });
});
