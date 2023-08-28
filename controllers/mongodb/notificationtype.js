const { NotificationType } = require('../../models/notificationtype');
const { getEventByID } = require('./event');
const { BadRequest, ConflictError } = require('../../utils/error');
const { upsertTags } = require('./tag');

async function createNotificationType(req) {
  if (!req.event) throw new BadRequest('"event" (event ID) is required');

  const event = await getEventByID(req.event);

  if (!event)
    throw new BadRequest('The event with the given ID was not found.');

  // check if notification type with same name and event id already exists
  const notifExists = await NotificationType.findOne({
    name: req.name,
    event: req.event,
    is_deleted: false,
  });

  if (notifExists)
    throw new ConflictError(
      'Notification type with the same name and event ID already exists',
    );

  if (req.tags) {
    await upsertTags(req.tags);
  }

  const notif = new NotificationType(req);

  return notif.save();
}

async function getNotificationTypeByID(id) {
  return NotificationType.findOne({ _id: id, is_deleted: false });
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
  if (!event) throw new Error('"event" (event ID) is required');

  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  sortOrder = Number(sortOrder);

  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';
  const nameRegex = new RegExp(like, 'i'); // 'i' -> case-insensitive
  const findQuery = {
    event,
    is_active: isActive,
    is_deleted: false, // only return non-deleted apps
  };

  if (like) findQuery.name = nameRegex;

  const totalNotifs = await NotificationType.countDocuments(findQuery);
  const query = NotificationType.find(findQuery).sort({
    [sortBy]: sortDirection,
  });

  if (pageNumber <= 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_notification_types: totalNotifs,
      notification_types: await query,
    };
  }

  // if pageSize is less than 1, set it to 1
  const ps = pageSize < 1 ? 1 : pageSize;
  const lastPage = Math.ceil(totalNotifs / ps);

  // if pageNumber is greater than lastPage, set it to lastPage
  pageNumber = pageNumber > lastPage ? lastPage : pageNumber; // eslint-disable-line

  const skipCount = (pageNumber - 1) * ps;

  return {
    current_page: pageNumber,
    last_page: lastPage,
    total_notification_types: totalNotifs,
    notification_types: await query.skip(skipCount).limit(ps),
  };
}

async function updateNotificationType(id, obj) {
  const notif = await getNotificationTypeByID(id);
  if (!notif) return false;

  Object.assign(notif, obj);
  notif.modified_at = Date.now();

  const ret = await notif.save();

  if (ret && notif.tags) {
    await upsertTags(notif.tags);
  }

  return ret;
}

async function deleteNotificationType(id) {
  return updateNotificationType(id, { is_active: false, is_deleted: true });
}

async function deleteNotificationTypes(ids) {
  return NotificationType.updateMany(
    { _id: { $in: ids } },
    { is_active: false, is_deleted: true },
  );
}

async function deleteNotificationTypesByEventID(id) {
  return NotificationType.updateMany(
    { event: id },
    { is_active: false, is_deleted: true },
  );
}

module.exports = {
  createNotificationType,
  getNotificationTypeByID,
  getNotificationTypes,
  updateNotificationType,
  deleteNotificationType,
  deleteNotificationTypes,
  deleteNotificationTypesByEventID,
};
