const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

let server;
let knex;

describe('/api/apps', () => {
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
  });

  afterEach(async () => {
    await knex.migrate.rollback(true);
  });

  describe('GET /', () => {
    it('should return all apps', async () => {
      const apps = [
        {
          name: 'ets',
          description: 'ets app',
          is_active: true,
        },
        {
          name: 'egs',
          description: 'egs app',
          is_active: true,
        },
        {
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        },
      ];

      await knex('applications').insert(apps);

      const res = await request(server).get('/api/apps/');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(3);
      expect(res.body.results.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.results.some((a) => a.name === 'egs')).toBeTruthy();
      expect(res.body.results.some((a) => a.name === 'xyz')).toBeTruthy();
    });

    it('should return all active apps', async () => {
      const apps = [
        {
          name: 'ets',
          description: 'ets app',
          is_active: true,
        },
        {
          name: 'egs',
          description: 'egs app',
          is_active: false, // made inactive
        },
        {
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        },
      ];

      await knex('applications').insert(apps);

      const res = await request(server).get('/api/apps/').query({
        isActive: true,
      });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.results.some((a) => a.name === 'xyz')).toBeTruthy();
    });

    it('should return 2 apps on page 1 and a single app on page 2', async () => {
      const apps = [
        {
          name: 'ets',
          description: 'ets app',
          is_active: true,
        },
        {
          name: 'egs',
          description: 'egs app',
          is_active: true,
        },
        {
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        },
      ];

      await knex('applications').insert(apps);

      const res1 = await request(server).get(
        '/api/apps/?pageNumber=1&pageSize=2',
      );

      expect(res1.status).toBe(StatusCodes.OK);
      expect(res1.body.results.length).toBe(2);

      const res2 = await request(server).get(
        '/api/apps/?pageNumber=2&pageSize=2',
      );

      expect(res2.status).toBe(StatusCodes.OK);
      expect(res2.body.results.length).toBe(1);
    });

    it('should return all apps sorted by their name in ascending order', async () => {
      const apps = [
        {
          name: 'ets',
          description: 'ets app',
          is_active: true,
        },
        {
          name: 'egs',
          description: 'egs app',
          is_active: true,
        },
        {
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        },
      ];

      await knex('applications').insert(apps);

      const res = await request(server).get(
        '/api/apps/?sortBy=name&sortOrder=1',
      );

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(3);
      expect(res.body.results[0].name).toBe('egs');
      expect(res.body.results[1].name).toBe('ets');
      expect(res.body.results[2].name).toBe('xyz');
    });

    it('should return all apps containing "e" in their name', async () => {
      const apps = [
        {
          name: 'ets',
          description: 'ets app',
          is_active: true,
        },
        {
          name: 'egs',
          description: 'egs app',
          is_active: true,
        },
        {
          name: 'xyz',
          description: 'xyz app',
          is_active: true,
        },
      ];

      await knex('applications').insert(apps);

      const res = await request(server).get('/api/apps/?like=e');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results.some((a) => a.name === 'ets')).toBeTruthy();
      expect(res.body.results.some((a) => a.name === 'egs')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return an app if a valid id is passed', async () => {
      const app = {
        name: 'ets',
        description: 'ets app',
        is_active: true,
      };

      const data = await knex('applications').insert(app).returning('*');
      const res = await request(server).get(`/api/apps/${data[0].id}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('name', app.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/apps/1');

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no app with the given id exists', async () => {
      const res = await request(server).get(`/api/apps/101`);

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
      const app = {
        name: 'app',
        is_active: true,
      };

      await knex('applications').insert(app);

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should save and return the app if request is valid', async () => {
      const res = await exec();
      const app = await knex('applications').where({ name: 'app' }).first();

      expect(res.status).toBe(StatusCodes.OK);
      expect(app).not.toBeNull();
      expect(app).toHaveProperty('id', res.body.id);
      expect(app).toHaveProperty('name', 'app');
    });
  });

  describe('DELETE /:id', () => {
    let app;
    let id;

    const exec = async () => request(server).delete(`/api/apps/${id}`).send();

    beforeEach(async () => {
      app = {
        name: 'app',
        is_active: true,
      };

      app = await knex('applications').insert(app).returning('*');
      app = app[0]; // eslint-disable-line

      id = app.id;
    });

    it('should return 404 if id is invalid', async () => {
      id = 'a';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if no app with the given id was found', async () => {
      id = 101;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the app', async () => {
      const res = await exec();
      const res2 = await knex('applications').where({ id }).first();

      expect(res.status).toBe(StatusCodes.OK);
      expect(res2.is_deleted).toBeTruthy();
      expect(res2.is_active).toBeFalsy();
    });

    it('should delete the app and its associated event(s)', async () => {
      const events = [
        {
          name: 'event1',
          description: 'event1',
          is_active: true,
          application: id,
        },
        {
          name: 'event2',
          description: 'event2',
          is_active: true,
          application: id,
        },
      ];

      await knex('events').insert(events);

      const res1 = await exec();
      const res2 = await knex('applications').where({ id }).first();
      const res3 = await knex('events').where({ application: id });

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
      const ev = {
        name: 'event1',
        description: 'event1',
        is_active: true,
        application: id,
      };

      let event = await knex('events').insert(ev).returning('*');
      event = event[0]; // eslint-disable-line

      const notificationTypes = [
        {
          name: 'notificationType1',
          description: 'notificationType1',
          template_subject: 'template_subject',
          template_body: 'template_body',
          is_active: true,
          event: event.id,
        },
        {
          name: 'notificationType2',
          description: 'notificationType2',
          template_subject: 'template_subject',
          template_body: 'template_body',
          is_active: true,
          event: event.id,
        },
      ];

      await knex('notificationtypes').insert(notificationTypes);

      const res1 = await exec();
      const res2 = await knex('applications').where({ id }).first();
      const res3 = await knex('events').where({ id: event.id }).first();
      const res4 = await knex('notificationtypes').where({ event: event.id });

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

  describe('DELETE /', () => {
    let apps;
    let ids;

    const exec = async () => request(server).delete(`/api/apps/`).send({ ids });

    beforeEach(async () => {
      apps = [
        {
          name: 'app1',
          is_active: true,
        },
        {
          name: 'app2',
          is_active: true,
        },
      ];

      apps = await knex('applications').insert(apps).returning('*');
      ids = apps.map((a) => a.id);
    });

    it('should return 404 if no apps with the given ids were found', async () => {
      ids = [101, 102];

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete the apps', async () => {
      const res = await exec();
      const res2 = await knex('applications').whereIn('id', ids);

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
    let app;
    let id;

    const exec = async () =>
      request(server).patch(`/api/apps/${id}`).send({ name: newName });

    beforeEach(async () => {
      app = {
        name: 'app',
        is_active: true,
      };

      app = await knex('applications').insert(app).returning('*');
      app = app[0]; // eslint-disable-line

      id = app.id;
      newName = 'updatedName';
    });

    it('should return 404 if app with the given id was not found', async () => {
      id = 'a';

      const res = await exec();

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 409 if app with the same name already exists', async () => {
      let app2 = {
        name: 'app2',
        is_active: true,
      };

      app2 = await knex('applications').insert(app2).returning('*');
      app2 = app2[0]; // eslint-disable-line

      newName = 'app';
      id = app2.id;

      const res = await exec();

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should update the app if input is valid', async () => {
      const res = await exec();
      const updatedApp = await knex('applications').where({ id }).first();

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
