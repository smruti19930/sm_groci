const { openDb } = require('./database');

async function createTable() {
  const db = await openDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_store_mappings (
      user_id INTEGER NOT NULL,
      store_id UUID NOT NULL,
      PRIMARY KEY (user_id, store_id)
    )
  `);
  console.log('user_store_mappings table created');
}

createTable();
