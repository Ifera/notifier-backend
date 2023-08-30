const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

let server;
let knex;
let app;
let event;
let notif;
let notifId;

describe('/api/message', () => {
  // run once before all tests
  beforeAll(() => {
    server = require('../../../../main');
    knex = require('../../../../knex/knex');
  });

  // run once after all tests
  afterAll(async () => {
    await server.close();
    await knex.destroy();
  });

  beforeEach(async () => {
    await knex.migrate.latest();

    app = {
      name: 'app',
      is_active: true,
    };

    app = await knex('applications').insert(app).returning('*');
    app = app[0]; // eslint-disable-line

    event = {
      name: 'event',
      is_active: true,
      application: app.id,
    };

    event = await knex('events').insert(event).returning('*');
    event = event[0]; // eslint-disable-line

    notif = {
      name: 'notif',
      template_subject: 'notif subj',
      template_body: 'notif body {{name}}',
      tags: 'name',
      is_active: true,
      event: event.id,
    };

    notif = await knex('notificationtypes').insert(notif).returning('*');
    notif = notif[0]; // eslint-disable-line

    notifId = notif.id;
  });

  afterEach(async () => {
    await knex.migrate.rollback(true);
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
      const message = await knex('messages').where({ id: res.body.id }).first();

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
      notifId = 101;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should fail with 400 if notification type is inactive', async () => {
      await knex('notificationtypes')
        .where({ id: notifId })
        .update({ is_active: false });

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 400 if event is inactive', async () => {
      await knex('events').where({ id: event.id }).update({ is_active: false });

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should fail with 400 if app is inactive', async () => {
      await knex('applications')
        .where({ id: app.id })
        .update({ is_active: false });

      const res = await exec();

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
