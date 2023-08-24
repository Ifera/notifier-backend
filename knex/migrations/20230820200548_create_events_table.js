/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('events', (t) => {
      t.increments('id').unsigned().primary();
      t.string('name', 45).notNullable();
      t.string('description', 255).notNullable().defaultTo('');
      t.boolean('is_active').notNullable().defaultTo(false);
      t.boolean('is_deleted').notNullable().defaultTo(false);
      t.dateTime('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      t.dateTime('modified_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      t.integer('application').notNullable();
      t.foreign('application')
        .references('id')
        .inTable('applications')
        .onDelete('CASCADE');

      t.index('application');
      // t.unique(['application', 'name']);
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_events_modified_at
      BEFORE UPDATE ON events
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
  return knex.schema
    .alterTable('events', (table) => {
      table.dropForeign('application');
    })
    .dropTable('events');
};
