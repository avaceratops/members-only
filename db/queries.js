const pool = require('./pool');

async function getAllMessages() {
  const { rows } = await pool.query(
    `SELECT
      messages.id,
      messages.title,
      messages.msg,
      users.forename,
      users.surname,
      TO_CHAR(messages.timestamp, 'DD/MM/YYYY HH24:MI') AS timestamp_formatted
    FROM messages
    JOIN users ON messages.user_id = users.id
    ORDER BY messages.timestamp DESC, messages.id DESC`
  );
  return rows;
}

async function insertMessage(userId, title, msg) {
  await pool.query(
    'INSERT INTO messages (user_id, title, msg) VALUES ($1, $2, $3)',
    [userId, title, msg]
  );
}

async function deleteMessage(messageId) {
  await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
}

async function getAllUsers() {
  const { rows } = await pool.query(
    'SELECT * FROM users ORDER BY is_admin DESC, is_member DESC, LOWER(username)'
  );
  return rows;
}

async function getUserByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [
    username,
  ]);
  return rows[0];
}

async function getUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0];
}

async function insertUser(
  username,
  password,
  email,
  forename,
  surname,
  isMember
) {
  const { rows } = await pool.query(
    `INSERT INTO users (username, password, email, forename, surname, is_member)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [username, password, email, forename, surname, isMember]
  );
  return rows[0];
}

async function updateUserMembership(userId) {
  const { rows } = await pool.query(
    'UPDATE users SET is_member = true WHERE id = $1 RETURNING *',
    [userId]
  );
  return rows[0];
}

async function updateUserFields(changes) {
  const allowedFields = ['is_member', 'is_admin'];
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // use a transaction

    const updatePromises = changes.map(({ id, field, value }) => {
      if (!allowedFields.includes(field)) {
        throw new Error(`Invalid field: ${field}`);
      }

      const query = `UPDATE users SET ${field} = $1 WHERE id = $2`;
      return client.query(query, [value, id]);
    });

    await Promise.all(updatePromises);
    await client.query('COMMIT'); // save all changes
  } catch (err) {
    await client.query('ROLLBACK'); // revert all changes
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllMessages,
  insertMessage,
  deleteMessage,
  getAllUsers,
  getUserByUsername,
  getUserByEmail,
  insertUser,
  updateUserMembership,
  updateUserFields,
};
