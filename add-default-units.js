const { openDb } = require('./database');

async function addDefaultUnits() {
  const db = await openDb();
  await db.exec(`
    INSERT INTO item_stock (itemId, stock, available_stock, price, unit) VALUES
    (1, 10, 10, 10, 'kg'),
    (2, 10, 10, 10, 'litre'),
    (3, 10, 10, 10, 'piece');
  `);
  console.log('Default units added');
}

addDefaultUnits();
