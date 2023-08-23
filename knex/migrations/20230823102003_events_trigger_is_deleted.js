/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_notificationtypes_is_deleted()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.is_deleted <> OLD.is_deleted THEN
            UPDATE notificationtypes SET is_deleted = NEW.is_deleted, is_active = false WHERE event = NEW.id;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER events_trigger_is_deleted
    AFTER UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_notificationtypes_is_deleted();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS events_trigger_is_deleted ON events; 
    DROP FUNCTION IF EXISTS update_notificationtypes_is_deleted;
  `);
};
