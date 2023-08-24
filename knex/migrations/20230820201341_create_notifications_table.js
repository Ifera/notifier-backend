/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('notificationtypes', (t) => {
      t.increments('id').unsigned().primary();
      t.string('name', 45).notNullable();
      t.string('description', 255).notNullable().defaultTo('');
      t.string('template_subject', 255).notNullable();
      t.text('template_body').notNullable();
      t.text('tags').notNullable().defaultTo('');
      t.boolean('is_active').notNullable().defaultTo(false);
      t.boolean('is_deleted').notNullable().defaultTo(false);
      t.dateTime('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      t.dateTime('modified_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      t.integer('event').notNullable();
      t.foreign('event').references('id').inTable('events').onDelete('CASCADE');

      t.index('event');
      // t.unique(['event', 'name']);
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_notificationtypes_modified_at
      BEFORE UPDATE ON notificationtypes
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
    .alterTable('notificationtypes', (table) => {
      table.dropForeign('event');
    })
    .dropTable('notificationtypes');
};
