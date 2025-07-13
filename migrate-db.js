const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function migrateDb() {
  const client = await pool.connect();
  try {
    // --- Clean up 'items' table ---

    // Check for and drop 'price' column
    const resPrice = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='price'");
    if (resPrice.rowCount > 0) {
      await client.query('ALTER TABLE items DROP COLUMN price;');
      console.log('Dropped price column from items table.');
    }

    // Check for and drop 'stock' column
    const resStock = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='stock'");
    if (resStock.rowCount > 0) {
      await client.query('ALTER TABLE items DROP COLUMN stock;');
      console.log('Dropped stock column from items table.');
    }

    // Check for and drop 'totalprice' column
    const resTotalPrice = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='totalprice'");
    if (resTotalPrice.rowCount > 0) {
      await client.query('ALTER TABLE items DROP COLUMN totalprice;');
      console.log('Dropped totalprice column from items table.');
    }

    // --- Ensure 'item_stock' table is correct ---

    // Check for and add 'price' column if it doesn't exist
    const resItemStockPrice = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='item_stock' AND column_name='price'");
    if (resItemStockPrice.rowCount === 0) {
      await client.query('ALTER TABLE item_stock ADD COLUMN price REAL;');
      console.log('Added price column to item_stock table.');
    }

    console.log('Database migration completed successfully.');
  } catch (err) {
    console.error('Error during database migration:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrateDb();
