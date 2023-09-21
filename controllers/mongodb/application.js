const { Application } = require('../../models/application');
const { Event } = require('../../models/event');
const { NotificationType } = require('../../models/notificationtype');
const { ConflictError } = require('../../utils/error');

async function createApp(req) {
  // check if app with same name already exists
  const appExists = await Application.findOne({
    name: { $regex: new RegExp(`^${req.name}$`, 'i') },
    is_deleted: false,
  });

  if (appExists)
    throw new ConflictError('Application with the same name already exists');

  const app = new Application(req);

  return app.save();
}

async function getAppByID(id) {
  return Application.findOne({ _id: id, is_deleted: false });
}

/**
 * Retrieves a paginated list of applications based on the specified parameters.
 *
 * @param {Object} options - Options for querying applications.
 * @param {string} [options.like=''] - Search for applications with names similar to the specified string.
 * @param {string} [options.sortBy='name'] - The field by which to sort the applications.
 * @param {number} [options.sortOrder=1] - The sort order: 1 for ascending, -1 for descending.
 * @param {number} [options.pageNumber=1] - The current page number for pagination. If 0, returns all results.
 * @param {number} [options.pageSize=3] - The number of applications to retrieve per page.
 * @param {boolean} [options.isActive=true] - Retrieve applications based on is_active flag.
 * @returns {Promise<Array>} A promise that resolves with an array of application documents.
 *
 * @example
 * const options = {
 *   like: 'example',       // Search for apps with names similar to 'example'
 *   sortBy: 'name',        // Sort applications by name
 *   sortOrder: -1,         // Sort in descending order
 *   pageNumber: 2,         // Retrieve the second page of results
 *   pageSize: 10           // Display 10 applications per page
 *   isActive: true         // Get only active applications
 * };
 * try {
 *   const applications = await getApps(options);
 *   console.log(applications); // Array of application documents
 * } catch (error) {
 *   console.error("Error:", error);
 * }
 */
async function getApps({
  like = '',
  sortBy = 'name',
  sortOrder = 1,
  pageNumber = 0,
  pageSize = 3,
  isActive = undefined,
}) {
  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  sortOrder = Number(sortOrder);

  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';
  const nameRegex = new RegExp(like, 'i'); // 'i' -> case-insensitive
  const findQuery = {
    is_deleted: false, // only return non-deleted apps
  };

  if (like) findQuery.name = nameRegex;
  if (isActive !== undefined) findQuery.is_active = isActive;

  const totalApps = await Application.countDocuments(findQuery);
  const query = Application.find(findQuery).sort({ [sortBy]: sortDirection });

  if (pageNumber <= 0 || totalApps === 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_count: totalApps,
      results: await query,
    };
  }

  // if pageSize is less than 1, set it to 1
  const ps = pageSize < 1 ? 1 : pageSize;
  const lastPage = Math.ceil(totalApps / ps);

  // if pageNumber is greater than lastPage, set it to lastPage
  pageNumber = pageNumber > lastPage ? lastPage : pageNumber; // eslint-disable-line

  const skipCount = (pageNumber - 1) * ps;

  return {
    current_page: pageNumber,
    last_page: lastPage,
    total_count: totalApps,
    results: await query.skip(skipCount).limit(ps),
  };
}

async function updateApp(id, obj) {
  const app = await getAppByID(id);
  if (!app) return false;

  // check if app with same name already exists
  if (obj.name && obj.name !== app.name) {
    const appExists = await Application.find({
      name: { $regex: new RegExp(`^${obj.name}$`, 'i') },
      is_deleted: false,
    });

    if (appExists.length > 0)
      throw new ConflictError('App with the same name already exists');
  }

  Object.assign(app, obj);
  app.modified_at = Date.now();

  return app.save();
}

async function deleteApp(id) {
  const app = await updateApp(id, { is_active: false, is_deleted: true });
  if (!app) return false;

  // delete all events associated with this app
  await Event.updateMany(
    { application: id },
    { $set: { is_active: false, is_deleted: true } },
  );

  // get the list of Event IDs associated with this app
  const eventIds = await Event.find({ application: id }).distinct('_id');

  // update related NotificationTypes
  await NotificationType.updateMany(
    { event: { $in: eventIds } },
    { $set: { is_active: false, is_deleted: true } },
  );

  return app;
}

async function deleteApps(ids) {
  const apps = await Application.updateMany(
    { _id: { $in: ids } },
    { $set: { is_active: false, is_deleted: true } },
  );

  if (apps.modifiedCount <= 0) return false;

  // delete all events associated with this app
  await Event.updateMany(
    { application: { $in: ids } },
    { $set: { is_active: false, is_deleted: true } },
  );

  // get the list of Event IDs associated with this app
  const eventIds = await Event.find({ application: { $in: ids } }).distinct(
    '_id',
  );

  // update related NotificationTypes
  await NotificationType.updateMany(
    { event: { $in: eventIds } },
    { $set: { is_active: false, is_deleted: true } },
  );

  return apps;
}

module.exports = {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
  deleteApps,
};
