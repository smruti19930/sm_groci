const { openDb } = require('./database');

const createTables = async () => {
  const db = await openDb();
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT CHECK (type IN ('store', 'warehouse')) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('locations table created or already exists.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID,
        location_id UUID,
        quantity INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(item_id, location_id)
      );
    `);
    console.log('inventory table created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_item_id_fkey') THEN
          ALTER TABLE inventory ADD CONSTRAINT inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;
        END IF;
      END;
      $$;
    `);
    console.log('inventory_item_id_fkey constraint created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_location_id_fkey') THEN
          ALTER TABLE inventory ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;
        END IF;
      END;
      $$;
    `);
    console.log('inventory_location_id_fkey constraint created or already exists.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_location_id UUID,
        to_location_id UUID,
        transfer_type TEXT CHECK (transfer_type IN ('in-transit', 'intra')) NOT NULL,
        status TEXT CHECK (status IN ('pending', 'in_transit', 'received')) DEFAULT 'pending',
        transfer_date DATE NOT NULL,
        received_date DATE,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('transfers table created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfers_from_location_id_fkey') THEN
          ALTER TABLE transfers ADD CONSTRAINT transfers_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE SET NULL;
        END IF;
      END;
      $$;
    `);
    console.log('transfers_from_location_id_fkey constraint created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfers_to_location_id_fkey') THEN
          ALTER TABLE transfers ADD CONSTRAINT transfers_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE SET NULL;
        END IF;
      END;
      $$;
    `);
    console.log('transfers_to_location_id_fkey constraint created or already exists.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS transfer_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transfer_id UUID,
        item_id UUID,
        quantity INT NOT NULL CHECK (quantity > 0)
      );
    `);
    console.log('transfer_items table created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfer_items_transfer_id_fkey') THEN
          ALTER TABLE transfer_items ADD CONSTRAINT transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE;
        END IF;
      END;
      $$;
    `);
    console.log('transfer_items_transfer_id_fkey constraint created or already exists.');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfer_items_item_id_fkey') THEN
          ALTER TABLE transfer_items ADD CONSTRAINT transfer_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;
        END IF;
      END;
      $$;
    `);
    console.log('transfer_items_item_id_fkey constraint created or already exists.');

  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
};

createTables();
