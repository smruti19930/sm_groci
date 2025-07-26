const { openDb } = require('./database');
const bcrypt = require('bcrypt');

async function hashPassword() {
  const db = await openDb();
  try {
    const hashedPassword = await bcrypt.hash('1234', 10);
    await db.query("UPDATE users SET password = $1 WHERE username = 'anda'", [hashedPassword]);
    console.log('Password for user "anda" has been hashed.');
  } catch (error) {
    console.error('Error hashing password:', error);
  } finally {
    db.release();
  }
}

hashPassword();
