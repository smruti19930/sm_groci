const { openDb } = require('./database');

async function mapUser() {
  const db = await openDb();
  try {
    const user = await db.query("SELECT id FROM users WHERE username = 'anda'");
    const store = await db.query("SELECT store_id FROM store WHERE store_name = 'Main Store'");

    if (user.rows.length === 0) {
      console.error('User "anda" not found');
      return;
    }

    if (store.rows.length === 0) {
      console.error('Store "Main Store" not found');
      return;
    }

    const userId = user.rows[0].id;
    const storeId = store.rows[0].store_id;

    await db.query(
      'INSERT INTO user_store_mappings (user_id, store_id) VALUES ($1, $2) ON CONFLICT (user_id, store_id) DO NOTHING',
      [userId, storeId]
    );

    console.log('Mapped user "anda" to "Main Store"');
  } catch (err) {
    console.error('Error mapping user:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

mapUser();
