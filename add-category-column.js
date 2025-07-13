const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function addCategoryColumn() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='category'");
    if (res.rowCount === 0) {
      await client.query("ALTER TABLE items ADD COLUMN category VARCHAR(255);");
      console.log('Successfully added category column to items table.');
    } else {
      console.log('category column already exists in items table.');
    }
  } catch (err) {
    console.error('Error adding category column:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addCategoryColumn();
