const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const mongoose = require('mongoose');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { NotificationType } = require('../../../../models/notificationtype');

let server;
let app;
let appId;

describe('/api/events', () => {
  beforeEach(async () => {
    server = require('../../../../main');

    app = new Application({
      name: 'app',
      description: 'app',
      is_active: true,
    });

    appId = app.id;

    await app.save();
  });

  afterEach(async () => {
    await server.close();
    await Application.deleteMany({});
    await Event.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all events of an app', async () => {
      const events = [
        new Event({
          name: 'on-login',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-message',
          is_active: true,
          application: appId,
        }),
      ];

      await Event.collection.insertMany(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(
        res.body.results.some((a) => a.name === 'on-message'),
      ).toBeTruthy();
    });

    it('should return all active events of an app', async () => {
      const events = [
        new Event({
          name: 'on-login',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-message',
          is_active: false, // made inactive
          application: appId,
        }),
      ];

      await Event.collection.insertMany(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
        isActive: true,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(1);
      expect(res.body.results.some((a) => a.name === 'on-login')).toBeTruthy();
    });

    it('should return 2 events on page 1 and a single event on page 2', async () => {
      const events = [
        new Event({
          name: 'on-login',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-message',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-logout',
          is_active: true,
          application: appId,
        }),
      ];

      await Event.collection.insertMany(events);

      const res1 = await request(server).get('/api/events/').query({
        application: appId,
        pageNumber: 1,
        pageSize: 2,
      });

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res1.body.results.length).toBe(2);

      const res2 = await request(server).get('/api/events/').query({
        application: appId,
        pageNumber: 2,
        pageSize: 2,
      });

      expect(res2.status).toBe(StatusCodes.OK);
      expect(res2.body.results.length).toBe(1);
    });

    it('should return all events sorted by their name in ascending order', async () => {
      const events = [
        new Event({
          name: 'on-login',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-message',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-logout',
          is_active: true,
          application: appId,
        }),
      ];

      await Event.collection.insertMany(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
        sortBy: 'name',
        sortOrder: 1,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(3);
      expect(res.body.results[0].name).toBe('on-login');
      expect(res.body.results[1].name).toBe('on-logout');
      expect(res.body.results[2].name).toBe('on-message');
    });

    it('should return all apps containing "log" in their name', async () => {
      const events = [
        new Event({
          name: 'on-login',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-message',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'on-logout',
          is_active: true,
          application: appId,
        }),
      ];

      await Event.collection.insertMany(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
        like: 'log',
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(res.body.results.some((a) => a.name === 'on-logout')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return an event if a valid id is passed', async () => {
      const event = new Event({
        name: 'on-login',
        is_active: true,
        application: appId,
      });

      await event.save();

      const res = await request(server).get(`/api/events/${event.id}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('name', event.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/events/1');

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no event with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/events/${id}`);

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    let name;
    let application;

    const exec = async () =>
      request(server).post('/api/events').send({ name, application });

    beforeEach(() => {
      name = 'event';
      application = appId;
    });

    it('should return 409 if event with the same name already exists', async () => {
      const event = new Event({ name: 'event', application });
      await event.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should save the event if request is valid', async () => {
      const res = await exec();
      const event = await Event.find({ name });

      expect(res.status).toBe(StatusCodes.OK);
      expect(event).not.toBeNull();
    });

    it('should return the app if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', name);
    });
  });

  describe('DELETE /:id', () => {
    let event;
    let id;

    const exec = async () => request(server).delete(`/api/events/${id}`).send();

    beforeEach(async () => {
      event = new Event({ name: 'event', application: appId });
      await event.save();

      id = event.id;
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

    it('should return 404 if no event with the given id was found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the event', async () => {
      const res1 = await exec();
      const res2 = await Event.findById(id);

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });

    it('should delete the event and its associated notification-types(s)', async () => {
      const notificationTypes = [
        new NotificationType({
          name: 'notificationType1',
          description: 'notificationType1',
          is_active: true,
          event: id,
        }),
        new NotificationType({
          name: 'notificationType2',
          description: 'notificationType2',
          is_active: true,
          event: id,
        }),
      ];

      await NotificationType.collection.insertMany(notificationTypes);

      const res1 = await exec();
      const res2 = await Event.findById(id);
      const res3 = await NotificationType.find({ event: id });

      expect(res1.status).toBe(StatusCodes.OK);

      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();

      expect(res3.length).toBe(2);
      expect(res3[0].is_deleted).toBeTruthy();
      expect(res3[0].is_active).toBeFalsy();
      expect(res3[1].is_deleted).toBeTruthy();
      expect(res3[1].is_active).toBeFalsy();
    });
  });

  describe('DELETE /', () => {
    let events;
    let ids;

    const exec = async () =>
      request(server).delete(`/api/events/`).send({ ids });

    beforeEach(async () => {
      events = [
        new Event({
          name: 'event1',
          is_active: true,
          application: appId,
        }),
        new Event({
          name: 'event2',
          is_active: true,
          application: appId,
        }),
      ];

      events = await Event.collection.insertMany(events);
      ids = Object.values(events.insertedIds);
    });

    it('should return 404 if no events with the given ids were found', async () => {
      ids = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the events', async () => {
      const res = await exec();
      const res2 = await Event.find({ _id: { $in: ids } });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res2.length).toBe(2);
      expect(res2[0].is_deleted).toBeTruthy();
      expect(res2[0].is_active).toBeFalsy();
      expect(res2[1].is_deleted).toBeTruthy();
      expect(res2[1].is_active).toBeFalsy();
    });
  });

  describe('PATCH /:id', () => {
    let newName;
    let event;
    let id;

    const exec = async () =>
      request(server).patch(`/api/events/${id}`).send({ name: newName });

    beforeEach(async () => {
      event = new Event({ name: 'event', application: appId });
      await event.save();

      id = event.id;
      newName = 'updatedName';
    });

    it('should return 404 if event with the given id was not found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 409 if event with the same name and application ID already exists', async () => {
      let event2 = new Event({
        name: 'event2',
        is_active: true,
        application: appId,
      });

      event2 = await event2.save();

      newName = 'event';
      id = event2.id;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should update the event if input is valid', async () => {
      const res = await exec();
      const updatedEvent = await Event.findById(id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(updatedEvent.name).toBe(newName);
    });

    it('should return the updated app if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newName);
    });

    it('should update the modified date on successful update', async () => {
      const oldDate = event.modified_at;
      const res = await exec();
      const newDate = res.body.modified_at;

      expect(res.status).toBe(StatusCodes.OK);
      expect(newDate).not.toBe(oldDate);
    });
  });
});
