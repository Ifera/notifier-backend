const knex = require('../../knex/knex');

async function upsertTags(tags) {
  const _tags = tags.map((tag) => ({
    label: tag,
  }));

  return knex('tags').insert(_tags).onConflict('label').ignore();
}

module.exports = {
  upsertTags,
};
