const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function addCreatedAtColumn() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='created_at'");
    if (res.rowCount === 0) {
      await client.query('ALTER TABLE transactions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;');
      console.log('Successfully added created_at column to transactions table.');
    } else {
      console.log('created_at column already exists in transactions table.');
    }
  } catch (err) {
    console.error('Error adding created_at column:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addCreatedAtColumn();
