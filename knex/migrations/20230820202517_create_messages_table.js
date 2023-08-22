/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('messages', (t) => {
      t.increments('id').unsigned().primary();
      t.string('subject', 255).notNullable();
      t.text('body').notNullable();
      t.text('email').notNullable();
      t.boolean('is_pending').notNullable().defaultTo(true);
      t.dateTime('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      t.dateTime('modified_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      t.integer('notification_type').notNullable();
      t.foreign('notification_type')
        .references('id')
        .inTable('notificationtypes');

      t.index('notification_type');
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_messages_modified_at
      BEFORE UPDATE ON messages
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
    .alterTable('messages', (table) => {
      table.dropForeign('notification_type');
    })
    .dropTable('messages');
};
