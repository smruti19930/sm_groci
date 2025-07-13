const { openDb } = require('./database');

async function initializeDatabase() {
  console.log('Initializing database...');
  try {
    const db = await openDb();
    // The openDb function already handles table creation.
    // We can add a simple query to verify the connection.
    await db.query('SELECT NOW()');
    console.log('Database initialized successfully and tables are created if they did not exist.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
  // The pool in database.js might need to be closed if it's not handled elsewhere
}

initializeDatabase();
