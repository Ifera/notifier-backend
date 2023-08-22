/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('applications', (t) => {
      t.increments('id').unsigned().primary();
      t.string('name', 45).notNullable();
      t.string('description', 255).notNullable().defaultTo('');
      t.boolean('is_active').notNullable().defaultTo(false);
      t.boolean('is_deleted').notNullable().defaultTo(false);
      t.dateTime('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      t.dateTime('modified_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_applications_modified_at
      BEFORE UPDATE ON applications
      FOR EACH ROW
      EXECUTE PROCEDURE update_modified_at();
      `),
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('applications');
};
