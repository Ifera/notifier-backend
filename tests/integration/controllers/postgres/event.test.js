const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

let server;
let knex;
let app;
let appId;

describe('/api/events', () => {
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

    appId = app.id;
  });

  afterEach(async () => {
    await knex.migrate.rollback(true);
  });

  describe('GET /', () => {
    it('should return all events of an app', async () => {
      const events = [
        {
          name: 'on-login',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-message',
          is_active: true,
          application: appId,
        },
      ];

      await knex('events').insert(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.events.length).toBe(2);
      expect(res.body.events.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(res.body.events.some((a) => a.name === 'on-message')).toBeTruthy();
    });

    it('should return all active events of an app', async () => {
      const events = [
        {
          name: 'on-login',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-message',
          is_active: false, // made inactv
          application: appId,
        },
      ];

      await knex('events').insert(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.events.length).toBe(1);
      expect(res.body.events.some((a) => a.name === 'on-login')).toBeTruthy();
    });

    it('should return 2 events on page 1 and a single event on page 2', async () => {
      const events = [
        {
          name: 'on-login',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-message',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-logout',
          is_active: true,
          application: appId,
        },
      ];

      await knex('events').insert(events);

      const res1 = await request(server).get('/api/events/').query({
        application: appId,
        pageNumber: 1,
        pageSize: 2,
      });

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res1.body.events.length).toBe(2);

      const res2 = await request(server).get('/api/events/').query({
        application: appId,
        pageNumber: 2,
        pageSize: 2,
      });

      expect(res2.status).toBe(StatusCodes.OK);
      expect(res2.body.events.length).toBe(1);
    });

    it('should return all events sorted by their name in ascending order', async () => {
      const events = [
        {
          name: 'on-login',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-message',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-logout',
          is_active: true,
          application: appId,
        },
      ];

      await knex('events').insert(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
        sortBy: 'name',
        sortOrder: 1,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.events.length).toBe(3);
      expect(res.body.events[0].name).toBe('on-login');
      expect(res.body.events[1].name).toBe('on-logout');
      expect(res.body.events[2].name).toBe('on-message');
    });

    it('should return all apps containing "log" in their name', async () => {
      const events = [
        {
          name: 'on-login',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-message',
          is_active: true,
          application: appId,
        },
        {
          name: 'on-logout',
          is_active: true,
          application: appId,
        },
      ];

      await knex('events').insert(events);

      const res = await request(server).get('/api/events/').query({
        application: appId,
        like: 'log',
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.events.length).toBe(2);
      expect(res.body.events.some((a) => a.name === 'on-login')).toBeTruthy();
      expect(res.body.events.some((a) => a.name === 'on-logout')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return an event if a valid id is passed', async () => {
      let event = {
        name: 'on-login',
        is_active: true,
        application: appId,
      };

      event = await knex('events').insert(event).returning('*');
      event = event[0]; // eslint-disable-line

      const res = await request(server).get(`/api/events/${event.id}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('name', event.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/events/a');

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no event with the given id exists', async () => {
      const res = await request(server).get(`/api/events/101`);

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
      const event = {
        name: 'event',
        is_active: true,
        application: appId,
      };

      await knex('events').insert(event);
      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should save and return the event if request is valid', async () => {
      const res = await exec();
      const event = await knex('events').where({ name }).first();

      expect(res.status).toBe(StatusCodes.OK);
      expect(event).not.toBeNull();
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', name);
    });
  });

  describe('DELETE /:id', () => {
    let event;
    let id;

    const exec = async () => request(server).delete(`/api/events/${id}`).send();

    beforeEach(async () => {
      event = {
        name: 'event',
        is_active: true,
        application: appId,
      };

      event = await knex('events').insert(event).returning('*');
      event = event[0]; // eslint-disable-line

      id = event.id;
    });

    it('should return 404 if id is invalid', async () => {
      id = 'a';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no event with the given id was found', async () => {
      id = 101;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the event', async () => {
      const res1 = await exec();
      const res2 = await knex('events').where({ id }).first();

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });

    it('should delete the event and its associated notification-types(s)', async () => {
      const notificationTypes = [
        {
          name: 'notificationType1',
          description: 'notificationType1',
          template_subject: 'template_subject',
          template_body: 'template_body',
          is_active: true,
          event: id,
        },
        {
          name: 'notificationType2',
          description: 'notificationType2',
          template_subject: 'template_subject',
          template_body: 'template_body',
          is_active: true,
          event: id,
        },
      ];

      await knex('notificationtypes').insert(notificationTypes);

      const res1 = await exec();
      const res2 = await knex('events').where({ id }).first();
      const res3 = await knex('notificationtypes').where({ event: id });

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
        {
          name: 'event1',
          is_active: true,
          application: appId,
        },
        {
          name: 'event2',
          is_active: true,
          application: appId,
        },
      ];

      events = await knex('events').insert(events).returning('*');
      ids = events.map((e) => e.id);
    });

    it('should return 404 if no events with the given ids were found', async () => {
      ids = [101, 102];

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the events', async () => {
      const res = await exec();
      const res2 = await knex('events').whereIn('id', ids);

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
      event = {
        name: 'event',
        is_active: true,
        application: appId,
      };

      event = await knex('events').insert(event).returning('*');
      event = event[0]; // eslint-disable-line

      id = event.id;
      newName = 'updatedName';
    });

    it('should return 404 if event with the given id was not found', async () => {
      id = 'a';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 409 if event with the same name and application ID already exists', async () => {
      let event2 = {
        name: 'event2',
        is_active: true,
        application: appId,
      };

      event2 = await knex('events').insert(event2).returning('*');
      event2 = event2[0]; // eslint-disable-line

      newName = 'event';
      id = event2.id;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should update the event if input is valid', async () => {
      const res = await exec();
      const updatedEvent = await knex('events').where({ id }).first();

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
