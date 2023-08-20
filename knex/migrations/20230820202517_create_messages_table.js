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
      t.text('recipient').notNullable();
      t.boolean('is_pending').notNullable().defaultTo(true);
      t.dateTime('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      t.dateTime('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      t.integer('notification').notNullable();
      t.foreign('notification')
        .references('id')
        .inTable('notificationtypes')
        .onDelete('CASCADE');

      t.index('notification');
    })
    .then(() =>
      knex.raw(`
      CREATE TRIGGER update_messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at();
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
      table.dropForeign('notification');
    })
    .dropTable('messages');
};
