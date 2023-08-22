const knex = require('../../knex/knex');

async function createNotificationType(req) {
  const _req = { ...req };
  if (_req.tags) _req.tags = _req.tags.join(';');

  const ret = await knex('notificationtypes').insert(_req).returning('*');

  if (req.tags) {
    const tags = req.tags.map((tag) => ({
      label: tag,
    }));

    await knex('tags').insert(tags).onConflict('label').ignore();
  }

  return !ret ? null : ret[0];
}

async function getNotificationTypeByID(id) {
  const notif = await knex('notificationtypes')
    .select('*')
    .where({ id })
    .andWhere('is_deleted', false)
    .first();

  if (!notif) return null;

  if (notif.tags) {
    notif.tags = notif.tags.split(';');
  }

  return notif;
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
async function getNotificationTypes({
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

  const totalNotifQuery = knex('notificationtypes')
    .count('id as totalNotifs')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .first();

  // Filter by name using regex (matches anywhere in the name)
  if (like) {
    totalNotifQuery.andWhere('name', '~*', `.*${like}.*`); // Case-insensitive regex search
  }

  const { totalNotifs } = await totalNotifQuery;
  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';

  const query = knex('notificationtypes')
    .select('*')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .orderBy(sortBy, sortDirection)
    .returning('*');

  if (like) {
    query.andWhere('name', '~*', `.*${like}.*`);
  }

  let notifs = await query;
  notifs.forEach((notif) => {
    if (notif.tags) notif.tags = notif.tags.split(';');
  });

  if (pageNumber <= 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_notification_types: totalNotifs,
      notification_types: notifs,
    };
  }

  // if pageSize is less than 1, set it to 1
  const ps = pageSize < 1 ? 1 : pageSize;
  const lastPage = Math.ceil(totalNotifs / ps);

  // if pageNumber is greater than lastPage, set it to lastPage
  pageNumber = pageNumber > lastPage ? lastPage : pageNumber; // eslint-disable-line

  const skipCount = (pageNumber - 1) * ps;

  notifs = await query.limit(ps).offset(skipCount);
  notifs.forEach((notif) => {
    if (notif.tags) notif.tags = notif.tags.split(';');
  });

  return {
    current_page: pageNumber,
    last_page: lastPage,
    total_notification_types: totalNotifs,
    notification_types: notifs,
  };
}

async function updateNotificationType(id, req) {
  const ret = await knex('notificationtypes')
    .update(req)
    .where({ id })
    .returning('*');

  return !ret ? null : ret[0];
}

async function deleteNotificationType(id) {
  const ret = await knex('notificationtypes')
    .delete()
    .where({ id })
    .returning('*');

  return !ret ? null : ret[0];
}

module.exports = {
  createNotificationType,
  getNotificationTypeByID,
  getNotificationTypes,
  updateNotificationType,
  deleteNotificationType,
};
