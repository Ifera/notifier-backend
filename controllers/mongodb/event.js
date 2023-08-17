const { Event } = require('../../models/event');
const { getAppByID } = require('./application');
const { ValidationError } = require('../../utils/error');

async function createEvent(req) {
  if (!req.application)
    throw new ValidationError('"application" (application ID) is required');

  const app = await getAppByID(req.application);
  if (!app)
    throw new ValidationError(
      'The application with the given ID was not found.',
    );

  const event = new Event(req);

  return event.save();
}

async function getEventByID(id) {
  return Event.findById(id);
}

/**
 * Retrieves a paginated list of events of an application based on the specified parameters.
 *
 * @param {Object} options - Options for querying applications.
 * @param {string} [options.application] - The application ID [Required].
 * @param {string} [options.like=''] - Search for event with names similar to the specified string.
 * @param {string} [options.sortBy='name'] - The field by which to sort the result. ['name','created_at','modified_at','is_active'].
 * @param {number} [options.sortOrder=1] - The sort order: 1 for ascending, -1 for descending.
 * @param {number} [options.pageNumber=1] - The current page number for pagination. If 0, returns all results.
 * @param {number} [options.pageSize=3] - The number of results to retrieve per page.
 * @param {boolean} [options.isActive=true] - Retrieve result based on is_active flag.
 * @returns {Promise<Array>} A promise that resolves with an array of resultant documents.
 *
 * @example
 * const options = {
 *   application: 'app id', // Application ID
 *   like: 'example',       // Search for events with names similar to 'example'
 *   sortBy: 'name',        // Sort events by name
 *   sortOrder: -1,         // Sort in descending order
 *   pageNumber: 2,         // Retrieve the second page of results
 *   pageSize: 10           // Display 10 events per page
 *   isActive: true         // Get only active events
 * };
 * try {
 *   const events = await getEvents(options);
 *   console.log(events); // Array of event documents
 * } catch (error) {
 *   console.error("Error:", error);
 * }
 */
async function getEvents({
  application,
  like = '',
  sortBy = 'name',
  sortOrder = 1,
  pageNumber = 0,
  pageSize = 3,
  isActive = true,
}) {
  if (!application)
    throw new Error('"application" (application ID) is required');

  /* eslint-disable no-param-reassign */
  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  sortOrder = Number(sortOrder);
  /* eslint-enable no-param-reassign */

  const sortDirection = sortOrder === -1 ? 'desc' : 'asc';
  const nameRegex = new RegExp(like, 'i'); // 'i' -> case-insensitive
  const findQuery = {
    application,
    is_active: isActive,
    is_deleted: false, // only return non-deleted apps
  };

  if (like) findQuery.name = nameRegex;

  const totalEvents = await Event.countDocuments(findQuery);
  const query = Event.find(findQuery).sort({ [sortBy]: sortDirection });

  if (pageNumber <= 0) {
    return {
      current_page: 1,
      last_page: 1,
      total_events: totalEvents,
      events: await query,
    };
  }

  // if pageSize is less than 1, set it to 1
  const ps = pageSize < 1 ? 1 : pageSize;
  const lastPage = Math.ceil(totalEvents / ps);

  // if pageNumber is greater than lastPage, set it to lastPage
  pageNumber = pageNumber > lastPage ? lastPage : pageNumber; // eslint-disable-line

  const skipCount = (pageNumber - 1) * ps;

  return {
    current_page: pageNumber,
    last_page: lastPage,
    total_events: totalEvents,
    events: await query.skip(skipCount).limit(ps),
  };
}

async function updateEvent(id, obj) {
  const event = await getEventByID(id);
  if (!event) return false;

  Object.assign(event, obj);
  event.modified_at = Date.now();

  return event.save();
}

async function deleteEvent(id) {
  return updateEvent(id, { is_active: false, is_deleted: true });
}

module.exports = {
  createEvent,
  getEventByID,
  getEvents,
  updateEvent,
  deleteEvent,
};

// ------------------------------------------------------------

// async function run() {
//   // eslint-disable-next-line global-require
//   const mongoose = require('mongoose');

//   // connect to mongodb
//   mongoose
//     .connect('mongodb://localhost:27017/notifier_dev')
//     .then(() => console.log('Connected to MongoDB...'))
//     .catch((err) => console.error(err.message));

//   console.log('run');

//   // const res = await createEvent({
//   //   name: 'event2',
//   //   description: 'event 1',
//   //   application: '64db37c263c48bbb1f2b9ced',
//   // });

//   // console.log(res);

//   const d = await Event.find().populate('application');

//   console.log(d);

//   // await createApp('egs', 'egs app');
//   // await createApp('ets ap 2', 'egs app 2');

//   // console.log(await getApps());

//   // const tempApp = {
//   //   name: 'app3',
//   //   description: 'another 1 updated',
//   //   is_active: false,
//   //   is_deleted: false,
//   // };

//   // await updateApp('', tempApp);
//   // await deleteApp('');

//   // console.log(await getAppByName('app2'));
//   // console.log(await getApps({ pageNumber: 0 }));
// }

// run();

// ------------------------------------------------------------
