const { openDb } = require('./database');

async function addBatchColumns() {
  const db = await openDb();

  try {
    await db.query('ALTER TABLE item_stock ADD COLUMN batch_code TEXT');
    console.log('Successfully added batch_code column to item_stock table.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('batch_code column already exists in item_stock table.');
    } else {
      // If the error is not about a duplicate column, we should see it.
      console.error('Error adding batch_code column:', error);
    }
  }

  try {
    await db.query('ALTER TABLE item_stock ADD COLUMN batch_date DATE');
    console.log('Successfully added batch_date column to item_stock table.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('batch_date column already exists in item_stock table.');
    } else {
      console.error('Error adding batch_date column:', error);
    }
  }

  try {
    await db.query('ALTER TABLE item_stock ADD COLUMN expiry_date DATE');
    console.log('Successfully added expiry_date column to item_stock table.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('expiry_date column already exists in item_stock table.');
    } else {
      console.error('Error adding expiry_date column:', error);
    }
  }
}

addBatchColumns();
