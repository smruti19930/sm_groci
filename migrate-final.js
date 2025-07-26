const { openDb } = require('./database');

const migrateFinal = async () => {
  const db = await openDb();
  try {
    await db.query('BEGIN');

    // Drop all dependent foreign keys
    console.log('Dropping foreign key constraints...');
    await db.query('ALTER TABLE item_stock DROP CONSTRAINT IF EXISTS item_stock_itemid_fkey');
    await db.query('ALTER TABLE item_stock DROP CONSTRAINT IF EXISTS item_stock_store_id_fkey');
    await db.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_itemid_fkey');
    await db.query('ALTER TABLE stock_ledger DROP CONSTRAINT IF EXISTS stock_ledger_item_id_fkey');
    await db.query('ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_item_id_fkey');
    await db.query('ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_location_id_fkey');
    await db.query('ALTER TABLE transfer_items DROP CONSTRAINT IF EXISTS transfer_items_item_id_fkey');
    await db.query('ALTER TABLE transfer_items DROP CONSTRAINT IF EXISTS transfer_items_transfer_id_fkey');
    await db.query('ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_from_location_id_fkey');
    await db.query('ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_to_location_id_fkey');

    // Drop primary keys
    console.log('Dropping primary key constraints...');
    await db.query('ALTER TABLE items DROP CONSTRAINT IF EXISTS items_pkey');
    await db.query('ALTER TABLE store DROP CONSTRAINT IF EXISTS store_pkey');
    await db.query('ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_pkey');
    await db.query('ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_pkey');

    // Alter columns to UUID
    console.log('Altering columns to UUID...');
    await db.query('ALTER TABLE items ALTER COLUMN id DROP DEFAULT');
    await db.query('ALTER TABLE items ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE store ALTER COLUMN store_id DROP DEFAULT');
    await db.query('ALTER TABLE store ALTER COLUMN store_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE locations ALTER COLUMN id DROP DEFAULT');
    await db.query('ALTER TABLE locations ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transfers ALTER COLUMN id DROP DEFAULT');
    await db.query('ALTER TABLE transfers ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid())');
    
    // Update foreign key columns in other tables
    await db.query('ALTER TABLE item_stock ALTER COLUMN itemId SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE item_stock ALTER COLUMN store_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transactions ALTER COLUMN itemId SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE stock_ledger ALTER COLUMN item_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE inventory ALTER COLUMN item_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE inventory ALTER COLUMN location_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transfer_items ALTER COLUMN item_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transfer_items ALTER COLUMN transfer_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transfers ALTER COLUMN from_location_id SET DATA TYPE UUID USING (gen_random_uuid())');
    await db.query('ALTER TABLE transfers ALTER COLUMN to_location_id SET DATA TYPE UUID USING (gen_random_uuid())');

    // Add primary keys back
    console.log('Adding primary key constraints back...');
    await db.query('ALTER TABLE items ADD PRIMARY KEY (id)');
    await db.query('ALTER TABLE items ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE store ADD PRIMARY KEY (store_id)');
    await db.query('ALTER TABLE store ALTER COLUMN store_id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE locations ADD PRIMARY KEY (id)');
    await db.query('ALTER TABLE locations ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    await db.query('ALTER TABLE transfers ADD PRIMARY KEY (id)');
    await db.query('ALTER TABLE transfers ALTER COLUMN id SET DEFAULT gen_random_uuid()');

    // Add foreign keys back
    console.log('Adding foreign key constraints back...');
    await db.query('ALTER TABLE item_stock ADD CONSTRAINT item_stock_itemid_fkey FOREIGN KEY (itemId) REFERENCES items(id)');
    await db.query('ALTER TABLE item_stock ADD CONSTRAINT item_stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES store(store_id)');
    await db.query('ALTER TABLE transactions ADD CONSTRAINT transactions_itemid_fkey FOREIGN KEY (itemId) REFERENCES items(id)');
    await db.query('ALTER TABLE stock_ledger ADD CONSTRAINT stock_ledger_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id)');
    await db.query('ALTER TABLE inventory ADD CONSTRAINT inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id)');
    await db.query('ALTER TABLE inventory ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id)');
    await db.query('ALTER TABLE transfer_items ADD CONSTRAINT transfer_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id)');
    await db.query('ALTER TABLE transfer_items ADD CONSTRAINT transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES transfers(id)');
    await db.query('ALTER TABLE transfers ADD CONSTRAINT transfers_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES locations(id)');
    await db.query('ALTER TABLE transfers ADD CONSTRAINT transfers_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES locations(id)');

    await db.query('COMMIT');
    console.log('Successfully migrated all tables to use UUIDs.');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error migrating tables:', err.message);
  } finally {
    db.release();
  }
};

migrateFinal();
