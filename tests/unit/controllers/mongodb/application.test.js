const {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
  deleteApps,
  isAppActive,
} = require('../../../../controllers/mongodb/application');

const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { NotificationType } = require('../../../../models/notificationtype');

// Mock the Mongoose models and functions
jest.mock('../../../../models/application');
jest.mock('../../../../models/event');
jest.mock('../../../../models/notificationtype');

// Import necessary error classes for testing
const { ConflictError, NotFound } = require('../../../../utils/error');

describe('MongoDB Application Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test createApp function
  describe('createApp', () => {
    it('should create a new application', async () => {
      const findOneMock = jest.fn(() => null);
      Application.findOne = findOneMock;

      const saveMock = jest.fn(() =>
        Promise.resolve({
          name: 'Test Application',
          description: 'Test Description',
        }),
      );
      Application.prototype.save = saveMock;

      const newApp = {
        name: 'Test Application',
        description: 'Test Description',
      };

      const result = await createApp(newApp);

      expect(result).toEqual({
        name: 'Test Application',
        description: 'Test Description',
      });
      expect(findOneMock).toHaveBeenCalledWith({
        name: 'Test Application',
        is_deleted: false,
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw ConflictError if an app with the same name exists', async () => {
      // Mock the Application model's findOne function to return an existing app with the same name
      const findOneMock = jest.fn(() => ({ name: 'Test Application' }));
      Application.findOne = findOneMock;

      const newApp = {
        name: 'Test Application',
        description: 'Test Description',
      };

      await expect(createApp(newApp)).rejects.toThrow(ConflictError);
    });
  });

  // Test getAppByID function
  describe('getAppByID', () => {
    it('should return an application by ID if it exists and is not deleted', async () => {
      // Mock the Application model's findOne function to return a test application
      const findOneMock = jest.fn(() => ({
        _id: 'testAppId',
        name: 'Test Application',
        is_deleted: false,
      }));
      Application.findOne = findOneMock;

      const result = await getAppByID('testAppId');

      expect(result).toEqual({
        _id: 'testAppId',
        name: 'Test Application',
        is_deleted: false,
      });
      expect(findOneMock).toHaveBeenCalledWith({
        _id: 'testAppId',
        is_deleted: false,
      });
    });

    it('should return an empty object if the application with the given ID does not exist', async () => {
      // Mock the Application model's findOne function to return null (no application found)
      const findOneMock = jest.fn(() => null);
      Application.findOne = findOneMock;

      await expect(getAppByID('nonExistentId')).resolves.toBeNull();
    });
  });

  // Test getApps function
  describe('getApps', () => {
    it('should return a list of applications based on the specified parameters', async () => {
      const countDocumentsMock = jest.fn(() => 3);
      Application.countDocuments = countDocumentsMock;

      Application.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { _id: 'app1', name: 'App 1', is_deleted: false },
          { _id: 'app2', name: 'App 2', is_deleted: false },
          { _id: 'app3', name: 'App 3', is_deleted: false },
        ]),
      });

      const options = {
        like: 'App',
        sortBy: 'name',
        sortOrder: 1,
        pageNumber: 1,
        pageSize: 3,
        isActive: true,
      };

      const result = await getApps(options);

      expect(result.total_apps).toBe(3);
      expect(result.apps).toHaveLength(3);
      expect(countDocumentsMock).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true, is_deleted: false }),
      );
    });

    it('should return all applications if pageNumber is 0', async () => {
      const countDocumentsMock = jest.fn(() => 3);
      Application.countDocuments = countDocumentsMock;

      const ret = jest.fn().mockResolvedValue([
        { _id: 'app1', name: 'App 1', is_deleted: false },
        { _id: 'app2', name: 'App 2', is_deleted: false },
        { _id: 'app3', name: 'App 3', is_deleted: false },
      ]);

      Application.find = jest.fn(() => ({
        sort: ret,
        skip: ret,
        limit: ret,
      }));

      const options = {
        pageNumber: 0,
        pageSize: 3,
      };

      const result = await getApps(options);

      expect(result.total_apps).toBe(3);
      expect(result.apps).toHaveLength(3);
    });
  });

  // Test updateApp function
  describe('updateApp', () => {
    it('should throw ConfliceError if application with the same name exists', async () => {
      Application.findOne = jest.fn(() => ({
        exec: jest.fn(() => ({
          _id: 'testAppId',
          name: 'Test App',
          is_deleted: false,
        })),
      }));

      Application.find = jest.fn(() => [
        {
          _id: 'testAppId',
          name: 'Test App',
          is_deleted: false,
        },
      ]);

      expect(async () => {
        await updateApp('testAppId', { name: 'Test App' });
      }).rejects.toThrow(ConflictError);
    });

    it('should update an application by ID', async () => {
      Application.findOne = jest.fn(() => ({
        exec: jest.fn(() => ({
          _id: 'testAppId',
          name: 'Test App',
          is_deleted: false,
        })),

        save: jest.fn(() =>
          Promise.resolve({
            _id: 'testAppId',
            name: 'Updated App',
            is_deleted: false,
          }),
        ),
      }));

      Application.find = jest.fn(() => []);

      const updatedApp = await updateApp('testAppId', { name: 'Updated App' });

      expect(updatedApp).toEqual({
        _id: 'testAppId',
        name: 'Updated App',
        is_deleted: false,
      });
    });

    it('should return false if the application with the given ID does not exist', async () => {
      Application.findOne = jest.fn(() => null);

      const updatedApp = await updateApp('nonExistentId', {
        name: 'Updated App',
      });

      expect(updatedApp).toBe(false);
    });
  });

  // Test deleteApp function
  describe('deleteApp', () => {
    it('should delete an application by ID and related data', async () => {
      Application.findOne = jest.fn(() => ({
        exec: jest.fn(() => ({
          _id: 'xyz',
          name: 'Test App',
          is_deleted: false,
        })),

        save: jest.fn(() =>
          Promise.resolve({
            _id: 'xyz',
            name: 'Test App',
            is_deleted: true,
          }),
        ),
      }));

      Event.updateMany = jest.fn();
      Event.find = jest.fn(() => ({
        distinct: jest.fn(() => []),
      }));

      const updatedApp = await deleteApp('xyz');

      expect(updatedApp).toEqual({
        _id: 'xyz',
        name: 'Test App',
        is_deleted: true,
      });
    });

    it('should return false if the application with the given ID does not exist', async () => {
      Application.findOne = jest.fn(() => null);

      const updatedApp = await deleteApp('nonExistentId');

      expect(updatedApp).toBe(false);
    });
  });

  // Test deleteApps function
  describe('deleteApps', () => {
    it('should delete multiple applications by IDs and related data', async () => {
      const updateManyMock = jest.fn(() => ({ nModified: 2 }));
      Application.updateMany = updateManyMock;

      const idsToDelete = ['app1Id', 'app2Id'];
      const result = await deleteApps(idsToDelete);

      expect(result.nModified).toBe(2);
      expect(updateManyMock).toHaveBeenCalledWith(
        { _id: { $in: idsToDelete } },
        { $set: { is_active: false, is_deleted: true } },
      );
    });
  });
});
