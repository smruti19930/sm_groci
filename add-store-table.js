const { openDb } = require('./database');

async function createStoreTable() {
  const db = await openDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store (
      store_id SERIAL PRIMARY KEY,
      store_name TEXT NOT NULL UNIQUE
    );
  `);

  await db.query('INSERT INTO store (store_name) VALUES ($1) ON CONFLICT (store_name) DO NOTHING', ['G-STORE']);
  await db.query(`
    INSERT INTO locations (name, type)
    SELECT store_name, 'store' FROM store
    ON CONFLICT DO NOTHING;
  `);

  console.log('Store table created and G-STORE inserted successfully.');
}

createStoreTable();
