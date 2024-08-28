const { Client } = require('pg');
require('dotenv').config();

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  forename VARCHAR(20) NOT NULL,
  surname VARCHAR(20) NOT NULL,
  email VARCHAR(30) NOT NULL,
  is_member BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
`;

const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100),
  msg TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
`;

const insertUser1 = `
INSERT INTO users (username, password, forename, surname, email, is_member, is_admin)
VALUES (
  'avaceratops',
  '$2a$12$YpU9SumH718hbC4SBXFFL..C7GAAI.74IR5i/oAoFgIMwqGQemBoe',
  'Ava',
  'Hocking',
  'ava@gmail.com',
  true,
  true
);
`;

const insertUser2 = `
INSERT INTO users (username, password, forename, surname, email, is_member)
VALUES (
  $1, -- username
  $2, -- password
  'Guest',
  'User',
  'me@me.com',
  true
);
`;

const insertMessages = `
INSERT INTO messages (user_id, title, msg) 
VALUES
  ((SELECT id FROM users WHERE username = 'avaceratops'), 'Test #1', 'This is a message.'),
  ((SELECT id FROM users WHERE username = 'avaceratops'), 'Test #2', 'This is a message.'),
  ((SELECT id FROM users WHERE username = 'avaceratops'), 'Test #3', 'This is a message.');
`;

async function main() {
  console.log('seeding...');
  const client = new Client({
    connectionString: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@localhost:${process.env.DATABASE_PORT}/members_only`,
  });
  await client.connect();

  // create tables
  await client.query(createUsersTable);
  await client.query(createMessagesTable);
  // insert data
  await client.query(insertUser1);
  await client.query(insertUser2, [
    process.env.GUEST_USERNAME,
    process.env.GUEST_PASSWORD,
  ]);
  await client.query(insertMessages);

  await client.end();
  console.log('done');
}

main();
