const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function resetDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Drop tables in reverse order of dependency to avoid foreign key constraint errors
    await client.query('DROP TABLE IF EXISTS transactions;');
    await client.query('DROP TABLE IF EXISTS item_stock;');
    await client.query('DROP TABLE IF EXISTS items;');
    await client.query('DROP TABLE IF EXISTS users;');
    console.log('All tables dropped successfully.');
    await client.query('COMMIT');
    console.log('Database reset complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during database reset:', err);
  } finally {
    client.release();
    pool.end();
  }
}

resetDb();
