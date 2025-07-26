const { openDb } = require('./database');

const addUniqueConstraintToVendor = async () => {
  const db = await openDb();
  const query = `
    ALTER TABLE vendor ADD CONSTRAINT vendor_name_unique UNIQUE (vendor_name);
  `;
  try {
    await db.query(query);
    console.log('Unique constraint added to vendor_name column in vendor table.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Unique constraint on vendor_name already exists.');
    } else {
      console.error('Error adding unique constraint to vendor_name column:', err.message);
    }
  }
};

addUniqueConstraintToVendor();
