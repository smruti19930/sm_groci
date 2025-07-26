const { openDb } = require('./database');

const migrateItemsToUuid = async () => {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE item_stock DROP CONSTRAINT item_stock_itemid_fkey');
    await db.query('ALTER TABLE transactions DROP CONSTRAINT transactions_itemid_fkey');
    await db.query('ALTER TABLE items DROP CONSTRAINT items_pkey');
    await db.query('ALTER TABLE items ALTER COLUMN id DROP DEFAULT');
    await db.query('ALTER TABLE items ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE item_stock ALTER COLUMN itemid SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transactions ALTER COLUMN itemid SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE items ADD PRIMARY KEY (id)');
    await db.query('ALTER TABLE items ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE item_stock ADD CONSTRAINT item_stock_itemid_fkey FOREIGN KEY (itemid) REFERENCES items(id)');
    await db.query('ALTER TABLE transactions ADD CONSTRAINT transactions_itemid_fkey FOREIGN KEY (itemid) REFERENCES items(id)');
    console.log('Migrated items table to use UUIDs.');
  } catch (err) {
    console.error('Error migrating items table:', err.message);
  }
};

migrateItemsToUuid();
