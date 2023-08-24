const knex = require('../../knex/knex');
const { ConflictError } = require('../../utils/error');

async function createApp(req) {
  // check if app with same name already exists
  const appExists = await knex('applications')
    .where({ name: req.name, is_deleted: false })
    .first();

  if (appExists)
    throw new ConflictError('Application with the same name already exists');

  const ret = await knex('applications').insert(req).returning('*');

  return !ret ? null : ret[0];
}

async function getAppByID(id) {
  return knex('applications')
    .select('*')
    .where({ id, is_deleted: false })
    .first();
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
  isActive = true,
}) {
  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  sortOrder = Number(sortOrder);

  const totalAppsQuery = knex('applications')
    .count('id as totalApps')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .first();

  // Filter by name using regex (matches anywhere in the name)
  if (like) {
    totalAppsQuery.andWhere('name', '~*', `.*${like}.*`); // Case-insensitive regex search
  }

  const res = await totalAppsQuery;
  const totalApps = Number(res.totalApps);
  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';

  const query = knex('applications')
    .select('*')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .orderBy(sortBy, sortDirection)
    .returning('*');

  if (like) {
    query.andWhere('name', '~*', `.*${like}.*`); // Case-insensitive regex search
  }

  if (pageNumber <= 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_apps: totalApps,
      apps: await query,
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
    total_apps: totalApps,
    apps: await query.limit(ps).offset(skipCount),
  };
}

async function updateApp(id, req) {
  const ret = await knex('applications')
    .update(req)
    .where({ id })
    .returning('*');

  return !ret ? null : ret[0];
}

async function deleteApp(id) {
  return updateApp(id, { is_active: false, is_deleted: true });
}

async function deleteApps(ids) {
  return knex('applications')
    .update({ is_active: false, is_deleted: true })
    .whereIn('id', ids)
    .returning('*');
}

module.exports = {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
  deleteApps,
};
