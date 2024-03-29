/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_modified_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.modified_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // In the down migration, you can drop the function if needed
  return knex.raw(`
    DROP FUNCTION IF EXISTS update_modified_at() CASCADE;
  `);
};
