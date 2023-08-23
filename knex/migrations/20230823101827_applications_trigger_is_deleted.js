/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_events_and_notificationtypes_is_deleted()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.is_deleted <> OLD.is_deleted THEN
            UPDATE events SET is_deleted = NEW.is_deleted, is_active = false WHERE application = NEW.id;
            UPDATE notificationtypes SET is_deleted = NEW.is_deleted, is_active = false WHERE event IN (SELECT id FROM events WHERE application = NEW.id);
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER applications_trigger_is_deleted
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_events_and_notificationtypes_is_deleted();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS applications_trigger_is_deleted ON applications; 
    DROP FUNCTION IF EXISTS update_events_and_notificationtypes_is_deleted;
  `);
};
