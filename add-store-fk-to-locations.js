const { openDb } = require('./database');

async function addStoreForeignKeyToLocations() {
  const db = await openDb();
  try {
    await db.query('BEGIN');

    // Add the store_id column to the locations table
    try {
      await db.query('ALTER TABLE locations ADD COLUMN store_id UUID');
      console.log('store_id column added to locations table.');
    } catch (error) {
      if (error.message.includes('column "store_id" of relation "locations" already exists')) {
        console.log('store_id column already exists in locations table.');
      } else {
        throw error;
      }
    }

    // Update the store_id in locations based on the store name
    await db.query(`
      UPDATE locations
      SET store_id = store.store_id
      FROM store
      WHERE locations.name = store.store_name;
    `);
    console.log('Populated store_id in locations table.');

    // Add the foreign key constraint
    try {
      await db.query('ALTER TABLE locations ADD CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES store(store_id)');
      console.log('Foreign key constraint added from locations to store.');
    } catch (error) {
        if (error.message.includes('constraint "fk_store" for relation "locations" already exists')) {
            console.log('Foreign key constraint from locations to store already exists.');
        } else {
            throw error;
        }
    }

    await db.query('COMMIT');
    console.log('Successfully added store_id reference to locations table.');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error adding store_id reference to locations table:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

addStoreForeignKeyToLocations();
