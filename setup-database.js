const { openDb } = require('./database');

async function setupDatabase() {
  const db = await openDb();
  try {
    // Start with a clean slate
    await db.query('DROP TABLE IF EXISTS stock_ledger, vendor, item_stock, transactions, items, store, users CASCADE');
    console.log('All tables dropped successfully.');

    // 1. Create users table
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      );
    `);
    console.log('Users table created.');

    // 2. Create store table
    await db.query(`
      CREATE TABLE store (
        store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_name TEXT NOT NULL,
        location TEXT
      );
    `);
    console.log('Store table created.');

    // 3. Insert a default store
    await db.query(`
      INSERT INTO store (store_name, location) VALUES ('Main Store', 'Default Location');
    `);
    console.log('Default store inserted.');

    // 4. Create items table
    await db.query(`
      CREATE TABLE items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        category VARCHAR(255)
      );
    `);
    console.log('Items table created.');

    // 5. Create vendor table
    await db.query(`
      CREATE TABLE vendor (
        vendor_id SERIAL PRIMARY KEY,
        vendor_name TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Vendor table created.');

    // 6. Create transactions table
    await db.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        invoiceNumber INTEGER,
        itemId UUID REFERENCES items(id),
        quantity INTEGER,
        price REAL,
        transaction_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Transactions table created.');

    // 7. Create item_stock table
    await db.query(`
      CREATE TABLE item_stock (
        id SERIAL PRIMARY KEY,
        itemId UUID REFERENCES items(id),
        store_id UUID REFERENCES store(store_id),
        stock INTEGER,
        available_stock INTEGER,
        price REAL,
        unit TEXT,
        barcode TEXT,
        batch_code TEXT,
        batch_date DATE,
        expiry_date DATE,
        vendor_id INTEGER REFERENCES vendor(vendor_id)
      );
    `);
    console.log('Item_stock table created.');

    // 8. Create stock_ledger table
    await db.query(`
      CREATE TABLE stock_ledger (
        id SERIAL PRIMARY KEY,
        store_id UUID REFERENCES store(store_id),
        item_category TEXT,
        item_id UUID REFERENCES items(id),
        item_name TEXT,
        transaction_type TEXT,
        ref_doc_no TEXT,
        ref_doc_date DATE,
        stock_in_qty INTEGER,
        stock_out_qty INTEGER,
        closing_stock INTEGER,
        batch_code TEXT,
        batch_date DATE,
        expiry_date DATE,
        vendor_id INTEGER REFERENCES vendor(vendor_id)
      );
    `);
    console.log('Stock_ledger table created.');

    console.log('Database setup complete. All tables created correctly.');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
