const { openDb } = require('./database');

const migrateStoreToUuid = async () => {
  const db = await openDb();
  try {
    await db.query('ALTER TABLE item_stock DROP CONSTRAINT item_stock_store_id_fkey');
    await db.query('ALTER TABLE store DROP CONSTRAINT store_pkey');
    await db.query('ALTER TABLE store ALTER COLUMN store_id DROP DEFAULT');
    await db.query('ALTER TABLE store ALTER COLUMN store_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE item_stock ALTER COLUMN store_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE store ADD PRIMARY KEY (store_id)');
    await db.query('ALTER TABLE store ALTER COLUMN store_id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE item_stock ADD CONSTRAINT item_stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES store(store_id)');
    console.log('Migrated store table to use UUIDs.');
  } catch (err) {
    console.error('Error migrating store table:', err.message);
  }
};

migrateStoreToUuid();
