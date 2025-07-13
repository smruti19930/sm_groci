const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function addPccUnit() {
  const client = await pool.connect();
  try {
    await client.query("INSERT INTO item_stock (unit) VALUES ('pcc')");
    console.log('Successfully added pcc unit to item_stock table.');
  } catch (err) {
    console.error('Error adding pcc unit:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addPccUnit();
