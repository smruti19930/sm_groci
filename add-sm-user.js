const { openDb } = require('./database');
const bcrypt = require('bcrypt');

async function addUser() {
  const db = await openDb();
  try {
    const hashedPassword = await bcrypt.hash('1234', 10);
    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING",
      ['sm', hashedPassword]
    );
    console.log('User "sm" created');
  } catch (err) {
    console.error('Error creating user:', err.message);
  } finally {
    if (db) {
      db.release();
    }
  }
}

addUser();
