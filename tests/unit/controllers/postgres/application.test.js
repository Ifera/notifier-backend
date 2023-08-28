const {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
  deleteApps,
} = require('../../../../controllers/postgres/application');

const knex = require('../../../../knex/knex');
const { ConflictError } = require('../../../../utils/error');

jest.mock('../../../../knex/knex');

describe('PostgreSQL Application Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test createApp function
  describe('createApp', () => {
    it('should create an application', async () => {
      const ret = { id: 1, name: 'Test App' };

      knex.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue([ret]),
        }),
        where: jest.fn().mockReturnValue({ first: jest.fn() }),
      });

      const req = { name: 'Test App' };
      const result = await createApp(req);

      expect(result).toEqual(ret);
    });

    it('should handle app creation conflict', async () => {
      const req = { name: 'Test App' };

      knex.mockReturnValue({
        where: jest.fn().mockReturnValue({
          first: jest.fn().mockReturnValue(req),
        }),
      });

      await expect(createApp(req)).rejects.toThrow(ConflictError);
    });
  });

  // Test getAppByID function
  describe('getAppByID', () => {
    it('should get an application by ID', async () => {
      const expectedApp = { id: 1, name: 'Test App' };

      knex.mockReturnValue({
        select: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            first: jest.fn().mockReturnValue(expectedApp),
          }),
        }),
      });

      const id = 1;
      const result = await getAppByID(id);

      expect(result).toEqual(expectedApp);
    });

    it('should return an empty object if the application does not exist', async () => {
      const id = 1;

      knex.mockReturnValue({
        select: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            first: jest.fn().mockReturnValue({}), // Simulate app not found
          }),
        }),
      });

      const result = await getAppByID(id);

      expect(result).toEqual({});
    });
  });

  // Test getApps function
  describe('getApps', () => {
    it('should retrieve a list of applications', async () => {
      const expectedApps = [
        { id: 1, name: 'App 1' },
        { id: 2, name: 'App 2' },
        { id: 3, name: 'App 3' },
      ];

      const countQuery = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnValue({ totalApps: expectedApps.length }),
        totalApps: expectedApps.length,
      };

      const selectQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnValue(expectedApps),
      };

      const queries = {
        count: jest.fn().mockReturnValue(countQuery),
        select: jest.fn().mockReturnValue(selectQuery),
      };

      knex.mockReturnValue(queries);

      const options = {
        like: 'App',
        sortBy: 'name',
        sortOrder: 1,
        pageNumber: 1,
        pageSize: 10,
        isActive: true,
      };

      const result = await getApps(options);

      expect(result).toEqual({
        current_page: 1,
        last_page: 1,
        total_apps: expectedApps.length,
        apps: expectedApps,
      });
    });
  });

  // Test updateApp function
  describe('updateApp', () => {
    it('should update an application', async () => {
      const updatedApp = { id: 1, name: 'Updated App' };

      knex.mockReturnValue({
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue([updatedApp]),
          }),
        }),
      });

      const id = 1;
      const req = { name: 'Updated App' };
      const result = await updateApp(id, req);

      expect(result).toEqual(updatedApp);
    });

    it('should return null if the application does not exist', async () => {
      const id = 1;
      const req = { name: 'Updated App' };

      knex.mockReturnValue({
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue([]), // Simulate no update
          }),
        }),
      });

      const result = await updateApp(id, req);

      expect(result).toBeNull();
    });
  });

  // Test deleteApp function
  describe('deleteApp', () => {
    it('should delete an application', async () => {
      const deletedApp = {
        id: 1,
        name: 'Deleted App',
        is_active: false,
        is_deleted: true,
      };

      knex.mockReturnValue({
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue([deletedApp]),
          }),
        }),
      });

      const result = await deleteApp(1);

      expect(result).toEqual(deletedApp);
    });

    it('should return null if the application does not exist', async () => {
      knex.mockReturnValue({
        update: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue([]),
          }),
        }),
      });

      const result = await deleteApp(1);

      expect(result).toBeNull();
    });
  });
});
