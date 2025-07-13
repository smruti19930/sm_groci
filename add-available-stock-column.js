const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function addAvailableStockColumn() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='item_stock' AND column_name='available_stock'");
    if (res.rowCount === 0) {
      await client.query('ALTER TABLE item_stock ADD COLUMN available_stock INTEGER;');
      console.log('Successfully added available_stock column to item_stock table.');
    } else {
      console.log('available_stock column already exists in item_stock table.');
    }
  } catch (err) {
    console.error('Error adding available_stock column:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addAvailableStockColumn();
