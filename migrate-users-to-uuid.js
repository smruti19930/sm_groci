const { openDb } = require('./database');

const migrateUsersToUuid = async () => {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE user_store_mappings DROP CONSTRAINT user_store_mappings_user_id_fkey');
    await db.query('ALTER TABLE users DROP CONSTRAINT users_pkey');
    await db.query('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
    await db.query('ALTER TABLE users ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE users ADD PRIMARY KEY (id)');
    await db.query('ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE user_store_mappings ADD CONSTRAINT user_store_mappings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)');
    console.log('Migrated users table to use UUIDs.');
  } catch (err) {
    console.error('Error migrating users table:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
};

migrateUsersToUuid();
