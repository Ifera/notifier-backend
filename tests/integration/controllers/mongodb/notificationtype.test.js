const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const mongoose = require('mongoose');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { NotificationType } = require('../../../../models/notificationtype');
const Tag = require('../../../../models/tag');

let server;
let app;
let appId;
let event;
let eventId;

describe('/api/notificationtypes', () => {
  beforeEach(async () => {
    server = require('../../../../main');

    app = new Application({
      name: 'app',
      description: 'app',
      is_active: true,
    });

    appId = app.id;

    event = new Event({
      name: 'event',
      is_active: true,
      application: appId,
    });

    eventId = event.id;

    await app.save();
    await event.save();
  });

  afterEach(async () => {
    await server.close();
    await Application.deleteMany({});
    await Event.deleteMany({});
    await NotificationType.deleteMany({});
    await Tag.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all notification types of an event', async () => {
      const types = [
        new NotificationType({
          name: 'on-login',
          template_subject: 'on-login subj',
          template_body: 'on-login body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-logout',
          template_subject: 'on-logout subj',
          template_body: 'on-logout body',
          is_active: true,
          event: eventId,
        }),
      ];

      await NotificationType.collection.insertMany(types);

      const res = await request(server).get('/api/notification-types/').query({
        event: eventId,
      });

      const notifs = res.body.notification_types;

      expect(res.status).toBe(StatusCodes.OK);
      expect(notifs.length).toBe(2);
      expect(notifs.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(notifs.some((a) => a.name === 'on-logout')).toBeTruthy();
    });

    it('should return all active notification types of an event', async () => {
      const types = [
        new NotificationType({
          name: 'on-login',
          template_subject: 'on-login subj',
          template_body: 'on-login body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-logout',
          template_subject: 'on-logout subj',
          template_body: 'on-logout body',
          is_active: false, // made inactive
          event: eventId,
        }),
      ];

      await NotificationType.collection.insertMany(types);

      const res = await request(server).get('/api/notification-types/').query({
        event: eventId,
      });

      const notifs = res.body.notification_types;

      expect(res.status).toBe(StatusCodes.OK);
      expect(notifs.length).toBe(1);
      expect(notifs.some((a) => a.name === 'on-login')).toBeTruthy();
    });

    it('should return 2 notifs on page 1 and a single type on page 2', async () => {
      const types = [
        new NotificationType({
          name: 'on-login',
          template_subject: 'on-login subj',
          template_body: 'on-login body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-message',
          template_subject: 'on-message subj',
          template_body: 'on-message body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-logout',
          template_subject: 'on-logout subj',
          template_body: 'on-logout body',
          is_active: true,
          event: eventId,
        }),
      ];

      await NotificationType.collection.insertMany(types);

      const res1 = await request(server).get('/api/notification-types/').query({
        event: eventId,
        pageNumber: 1,
        pageSize: 2,
      });

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res1.body.notification_types.length).toBe(2);

      const res2 = await request(server).get('/api/notification-types/').query({
        event: eventId,
        pageNumber: 2,
        pageSize: 2,
      });

      expect(res2.status).toBe(StatusCodes.OK);
      expect(res2.body.notification_types.length).toBe(1);
    });

    it('should return all events sorted by their name in ascending order', async () => {
      const types = [
        new NotificationType({
          name: 'on-login',
          template_subject: 'on-login subj',
          template_body: 'on-login body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-message',
          template_subject: 'on-message subj',
          template_body: 'on-message body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-logout',
          template_subject: 'on-logout subj',
          template_body: 'on-logout body',
          is_active: true,
          event: eventId,
        }),
      ];

      await NotificationType.collection.insertMany(types);

      const res = await request(server).get('/api/notification-types/').query({
        event: eventId,
        sortBy: 'name',
        sortOrder: 1,
      });

      const notifs = res.body.notification_types;

      expect(res.status).toBe(StatusCodes.OK);
      expect(notifs.length).toBe(3);
      expect(notifs[0].name).toBe('on-login');
      expect(notifs[1].name).toBe('on-logout');
      expect(notifs[2].name).toBe('on-message');
    });

    it('should return all notifs containing "log" in their name', async () => {
      const types = [
        new NotificationType({
          name: 'on-login',
          template_subject: 'on-login subj',
          template_body: 'on-login body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-message',
          template_subject: 'on-message subj',
          template_body: 'on-message body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'on-logout',
          template_subject: 'on-logout subj',
          template_body: 'on-logout body',
          is_active: true,
          event: eventId,
        }),
      ];

      await NotificationType.collection.insertMany(types);

      const res = await request(server).get('/api/notification-types/').query({
        event: eventId,
        like: 'log',
      });

      const notifs = res.body.notification_types;

      expect(res.status).toBe(StatusCodes.OK);
      expect(notifs.length).toBe(2);
      expect(notifs.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(notifs.some((a) => a.name === 'on-logout')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a notification type if valid id is passed', async () => {
      const notif = new NotificationType({
        name: 'notif',
        template_subject: 'notif subj',
        template_body: 'notif body',
        is_active: true,
        event: eventId,
      });

      await notif.save();

      const res = await request(server).get(
        `/api/notification-types/${notif.id}`,
      );

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('name', notif.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/notification-types/1');

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no event with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/notification-types/${id}`);

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    let name;

    const exec = async () =>
      request(server).post('/api/notification-types').send({
        name,
        template_subject: 'notif subj',
        template_body: 'notif body {name} {date}',
        event: eventId,
      });

    beforeEach(() => {
      name = 'notif';
    });

    it('should return 409 if notification type with the same name already exists', async () => {
      const notif = new NotificationType({
        name: 'notif',
        template_subject: 'notif subj',
        template_body: 'notif body',
        is_active: true,
        event: eventId,
      });

      await notif.save();
      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should return the notification type and upsert the tags', async () => {
      const res = await exec();
      const notif = await NotificationType.findOne({ name });
      const tags = await Tag.find({});

      expect(res.status).toBe(StatusCodes.OK);
      expect(notif).not.toBeNull();
      expect(notif).toHaveProperty('id');
      expect(notif).toHaveProperty('name', name);
      expect(notif.tags).toEqual(['name', 'date']);

      expect(tags.length).toBe(2);
      expect(tags.some((a) => a.label === 'name')).toBeTruthy();
      expect(tags.some((a) => a.label === 'date')).toBeTruthy();
    });
  });

  describe('DELETE /:id', () => {
    let notif;
    let id;

    const exec = async () =>
      request(server).delete(`/api/notification-types/${id}`).send();

    beforeEach(async () => {
      notif = new NotificationType({
        name: 'notif',
        template_subject: 'notif subj',
        template_body: 'notif body',
        is_active: true,
        event: eventId,
      });
      await notif.save();

      id = notif.id;
    });

    afterEach(async () => {
      await NotificationType.deleteMany({});
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no notification type with the given id was found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the notification type', async () => {
      const res1 = await exec();
      const res2 = await NotificationType.findById(id);

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });
  });

  describe('DELETE /', () => {
    let notifs;
    let ids;

    const exec = async () =>
      request(server).delete(`/api/notification-types/`).send({ ids });

    beforeEach(async () => {
      notifs = [
        new NotificationType({
          name: 'notif1',
          template_subject: 'notif1 subj',
          template_body: 'notif1 body',
          is_active: true,
          event: eventId,
        }),
        new NotificationType({
          name: 'notif2',
          template_subject: 'notif2 subj',
          template_body: 'notif2 body',
          is_active: true,
          event: eventId,
        }),
      ];

      notifs = await NotificationType.collection.insertMany(notifs);
      ids = Object.values(notifs.insertedIds);
    });

    it('should return 404 if no notification types with the given ids were found', async () => {
      ids = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the notification types', async () => {
      const res = await exec();
      const res2 = await NotificationType.find({ _id: { $in: ids } });

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
    let notif;
    let id;

    const exec = async () =>
      request(server)
        .patch(`/api/notification-types/${id}`)
        .send({ name: newName });

    beforeEach(async () => {
      notif = new NotificationType({
        name: 'notif',
        template_subject: 'notif subj',
        template_body: 'notif body',
        is_active: true,
        event: eventId,
      });
      await notif.save();

      id = notif.id;
      newName = 'updatedName';
    });

    it('should return 404 if notification type with the given id was not found', async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 409 if notification type with the same name already exists', async () => {
      const notif2 = new NotificationType({
        name: 'notif2',
        template_subject: 'notif2 subj',
        template_body: 'notif2 body',
        is_active: true,
        event: eventId,
      });
      await notif2.save();

      newName = 'notif';
      id = notif2.id;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should update the notification type if input is valid', async () => {
      const res = await exec();
      const updated = await NotificationType.findById(id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(updated.name).toBe(newName);
    });

    it('should return the updated notification type if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newName);
    });

    it('should update the modified date on successful update', async () => {
      const oldDate = notif.modified_at;
      const res = await exec();
      const newDate = res.body.modified_at;

      expect(res.status).toBe(StatusCodes.OK);
      expect(newDate).not.toBe(oldDate);
    });
  });
});
