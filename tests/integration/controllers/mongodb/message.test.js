const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const mongoose = require('mongoose');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { NotificationType } = require('../../../../models/notificationtype');
const { Message } = require('../../../../models/message');

let server;
let app;
let event;
let notif;
let notifId;

describe('/api/message', () => {
  beforeEach(async () => {
    server = require('../../../../main');

    app = new Application({
      name: 'app',
      description: 'app',
      is_active: true,
    });

    event = new Event({
      name: 'event',
      is_active: true,
      application: app.id,
    });

    notif = new NotificationType({
      name: 'notif',
      template_subject: 'notif subj',
      template_body: 'notif body {{name}}',
      tags: ['name'],
      is_active: true,
      event: event.id,
    });

    notifId = notif.id;

    await app.save();
    await event.save();
    await notif.save();
  });

  afterEach(async () => {
    await server.close();
    await Application.deleteMany({});
    await Event.deleteMany({});
    await NotificationType.deleteMany({});
    await Message.deleteMany({});
  });

  describe('POST /', () => {
    let metadata;

    beforeEach(() => {
      metadata = {
        name: 'name',
      };
    });

    const exec = async () =>
      request(server).post('/api/message').send({
        email: 'test@test.com',
        notification_type: notifId,
        metadata,
      });

    it('should save the message', async () => {
      const res = await exec();
      const message = await Message.findById(res.body.id);

      expect(res.status).toBe(StatusCodes.OK);
      expect(message).not.toBeNull();
    });

    it('should fail with 400 if metadata does not contain the required tags', async () => {
      metadata = {};

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 400 if metadata contains tags other than the required ones', async () => {
      metadata = {
        name: 'name',
        other: 'other',
      };

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 404 if notification id was not found', async () => {
      notifId = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should fail with 400 if notification type is inactive', async () => {
      notif.is_active = false;
      await notif.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 400 if event is inactive', async () => {
      event.is_active = false;
      await event.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 400 if app is inactive', async () => {
      app.is_active = false;
      await app.save();

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
