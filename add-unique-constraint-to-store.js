const { openDb } = require('./database');

async function addUniqueConstraint() {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE store ADD CONSTRAINT store_name_unique UNIQUE (store_name)');
    console.log('Successfully added UNIQUE constraint to store_name column in store table.');
  } catch (error) {
    if (error.message.includes('constraint "store_name_unique" for relation "store" already exists')) {
      console.log('UNIQUE constraint on store_name already exists.');
    } else {
      console.error('Error adding UNIQUE constraint:', error);
    }
  } finally {
    if (db) {
      db.release();
    }
  }
}

addUniqueConstraint();
