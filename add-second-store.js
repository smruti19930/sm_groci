const { openDb } = require('./database');

async function addSecondStore() {
  const db = await openDb();
  try {
    await db.query(`
      INSERT INTO store (store_name, location) 
      VALUES ('Second Store', 'Second Location') 
      ON CONFLICT (store_name) DO NOTHING;
    `);
    console.log('Second store added or already exists.');
  } catch (error) {
    console.error('Error adding second store:', error);
  }
}

addSecondStore();
