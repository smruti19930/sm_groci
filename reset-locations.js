const { openDb } = require('./database');

async function resetLocations() {
  const db = await openDb();
  try {
    await db.query('TRUNCATE TABLE locations RESTART IDENTITY CASCADE');
    console.log('Locations table truncated successfully.');

    await db.query(`
      INSERT INTO locations (id, name, type, store_id)
      SELECT gen_random_uuid(), store_name, 'store', store_id FROM store
      ON CONFLICT DO NOTHING;
    `);
    console.log('Locations table repopulated from store table successfully.');
  } catch (err) {
    console.error('Error resetting locations table:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

resetLocations();
