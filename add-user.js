const { openDb } = require('./database');

async function addUser() {
  const db = await openDb();
  try {
    // In a real application, you should hash the password.
    await db.query("INSERT INTO users (username, password) VALUES ('anda', '1234')");
    console.log('User "anda" added successfully.');
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

addUser();
