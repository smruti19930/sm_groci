const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function addIndex() {
  const client = await pool.connect();
  try {
    await client.query('CREATE INDEX IF NOT EXISTS idx_item_stock_itemId ON item_stock(itemId);');
    console.log('Successfully created index on item_stock(itemId) to improve performance.');
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addIndex();
