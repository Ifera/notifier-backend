const knex = require('../../knex/knex');
const { upsertTags } = require('./tag');
const { getEventByID } = require('./event');
const { BadRequest, ConflictError } = require('../../utils/error');

async function createNotificationType(req) {
  if (!req.event) throw new BadRequest('"event" (event ID) is required');

  // check if event exists
  const event = await getEventByID(req.event);

  if (!event)
    throw new BadRequest('The event with the given ID was not found.');

  // check if notification type with same name and event ID already exists
  const notifExists = await knex('notificationtypes')
    .where({
      name: req.name,
      event: req.event,
      is_deleted: false,
    })
    .first();

  if (notifExists)
    throw new ConflictError(
      'Notification type with the same name and event ID already exists',
    );

  const _req = { ...req };
  if (_req.tags) _req.tags = _req.tags.join(';');

  const ret = await knex('notificationtypes').insert(_req).returning('*');

  // do this after creating the notification type
  // so that in case of error, the tags are not upserted

  if (ret && req.tags.length > 0) {
    await upsertTags(req.tags);
  }

  return ret.length === 0 ? null : ret[0];
}

async function getNotificationTypeByID(id) {
  const notif = await knex('notificationtypes')
    .select('*')
    .where({ id, is_deleted: false })
    .first();

  if (!notif) return null;

  if (notif.tags) {
    notif.tags = notif.tags.split(';');
  }

  return notif;
}

/**
 * Retrieves a paginated list of notification tyoes of an event based on the specified parameters.
 *
 * @param {Object} options - Options for querying applications.
 * @param {string} [options.event] - The event ID [Required].
 * @param {string} [options.like=''] - Search query with names similar to the specified string.
 * @param {string} [options.sortBy='name'] - The field by which to sort the result. ['name','created_at','modified_at','is_active'].
 * @param {number} [options.sortOrder=1] - The sort order: 1 for ascending, -1 for descending.
 * @param {number} [options.pageNumber=1] - The current page number for pagination. If 0, returns all results.
 * @param {number} [options.pageSize=3] - The number of results to retrieve per page.
 * @param {boolean} [options.isActive=true] - Retrieve result based on is_active flag.
 * @returns {Promise<Array>} A promise that resolves with an array of resultant documents.
 *
 * @example
 * const options = {
 *   event: 'event id',     // Event ID
 *   like: 'example',       // Search for notification types with names similar to 'example'
 *   sortBy: 'name',        // Sort notification types by name
 *   sortOrder: -1,         // Sort in descending order
 *   pageNumber: 2,         // Retrieve the second page of results
 *   pageSize: 10           // Display 10 notification types per page
 *   isActive: true         // Get only active notification types
 * };
 * try {
 *   const notifs = await getNotificationTypes(options);
 *   console.log(notifs); // Array of documents
 * } catch (error) {
 *   console.error("Error:", error);
 * }
 */
async function getNotificationTypes({
  event,
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
    .andWhere('event', event)
    .first();

  // Filter by name using regex (matches anywhere in the name)
  if (like) {
    totalNotifQuery.andWhere('name', '~*', `.*${like}.*`); // Case-insensitive regex search
  }

  const res = await totalNotifQuery;
  const totalNotifs = Number(res.totalNotifs);
  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';

  const query = knex('notificationtypes')
    .select('*')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .andWhere('event', event)
    .orderBy(sortBy, sortDirection)
    .returning('*');

  if (like) {
    query.andWhere('name', '~*', `.*${like}.*`);
  }

  let notifs = await query;
  notifs.forEach((notif) => {
    if (notif.tags) notif.tags = notif.tags.split(';');
  });

  if (pageNumber <= 0 || totalNotifs <= 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_count: totalNotifs,
      results: notifs,
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
    total_count: totalNotifs,
    results: notifs,
  };
}

async function updateNotificationType(id, req) {
  const _req = { ...req };
  if (_req.tags) _req.tags = _req.tags.join(';');

  // check if notification type with the same name and event id exists
  // the event id is checked by ignoring the current notification type
  if (req.name) {
    const notifExists = await knex('notificationtypes')
      .select('*')
      .where({
        name: req.name,
        is_deleted: false,
      })
      .whereNot({ id });

    if (notifExists.length > 0) {
      throw new ConflictError(
        'Notification type with the same name and event ID already exists',
      );
    }
  }

  const ret = await knex('notificationtypes')
    .update(_req)
    .where({ id })
    .returning('*');

  // do this after updating the notification type
  // so that in case of error, the tags are not upserted
  if (ret && req.tags?.length > 0) {
    await upsertTags(req.tags);
  }

  return !ret ? null : ret[0];
}

async function deleteNotificationType(id) {
  return updateNotificationType(id, { is_active: false, is_deleted: true });
}

async function deleteNotificationTypes(ids) {
  return knex('notificationtypes')
    .update({ is_active: false, is_deleted: true })
    .whereIn('id', ids)
    .returning('*');
}

module.exports = {
  createNotificationType,
  getNotificationTypeByID,
  getNotificationTypes,
  updateNotificationType,
  deleteNotificationType,
  deleteNotificationTypes,
};
