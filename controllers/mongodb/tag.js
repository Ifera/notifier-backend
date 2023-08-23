const Tag = require('../../models/tag');

async function upsertTags(tags) {
  const bulkUpdateTags = tags.map((tag) => ({
    updateOne: {
      filter: { label: tag },
      update: { $setOnInsert: { label: tag } },
      upsert: true,
    },
  }));

  return Tag.bulkWrite(bulkUpdateTags);
}

module.exports = {
  upsertTags,
};
