const { openDb } = require('./database');

const createVendorTable = async () => {
  const db = await openDb();
  const query = `
    CREATE TABLE IF NOT EXISTS vendor (
      vendor_id SERIAL PRIMARY KEY,
      vendor_name TEXT NOT NULL
    )
  `;
  try {
    await db.query(query);
    console.log('Vendor table created or already exists.');
  } catch (err) {
    console.error('Error creating vendor table:', err.message);
  }
};

createVendorTable();
