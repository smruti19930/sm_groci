const { openDb } = require('./database');

async function reInitData() {
  const db = await openDb();
  try {
    await db.query('BEGIN');

    // Insert Main Store
    await db.query(`
      INSERT INTO store (store_name, location) VALUES ('Main Store', 'Default Location') ON CONFLICT (store_name) DO NOTHING;
    `);
    console.log('Main store inserted or already exists.');

    // Insert Second Store
    await db.query(`
      INSERT INTO store (store_name, location) VALUES ('Second Store', 'Second Location') ON CONFLICT (store_name) DO NOTHING;
    `);
    console.log('Second store inserted or already exists.');

    // Truncate and repopulate locations
    await db.query('TRUNCATE TABLE locations RESTART IDENTITY CASCADE');
    console.log('Locations table truncated successfully.');

    await db.query(`
      INSERT INTO locations (name, type, store_id)
      SELECT store_name, 'store', store_id FROM store;
    `);
    console.log('Locations table repopulated from store table successfully.');
    
    await db.query('COMMIT');
    console.log('Successfully re-initialized stores and locations.');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error re-initializing stores and locations:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

reInitData();
