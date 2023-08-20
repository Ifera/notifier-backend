const knex = require('../../knex/knex');

async function createApp(req) {
  const ret = await knex('applications').insert(req).returning('*');
  return !ret ? null : ret[0];
}

async function getAppByID(id) {
  return knex('applications')
    .select('*')
    .where({ id })
    .andWhere('is_deleted', false)
    .first();
}

async function getApps({
  like = '',
  sortBy = 'name',
  sortOrder = 1,
  pageNumber = 0,
  pageSize = 3,
  isActive = true,
}) {
  /* eslint-disable no-param-reassign */
  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  sortOrder = Number(sortOrder);
  /* eslint-enable no-param-reassign */

  const totalAppsQuery = knex('applications')
    .count('id as totalApps')
    .where('is_deleted', false)
    .andWhere('is_active', isActive)
    .first();

  // Filter by name using regex (matches anywhere in the name)
  if (like) {
    totalAppsQuery.andWhere('name', '~*', `.*${like}.*`); // Case-insensitive regex search
  }

  const { totalApps } = await totalAppsQuery;
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
  const ret = await knex('applications').delete().where({ id }).returning('*');
  return !ret ? null : ret[0];
}

module.exports = {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
};
