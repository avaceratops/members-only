const mongoose = require('mongoose');
require('dotenv').config();

console.log('Populates the database with some default data');

const Message = require('./models/message');
const User = require('./models/user');

const messages = [];

// Set up mongoose connection
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;
main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createMessages();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

async function messageCreate(index, title, msg) {
  const author = await User.findOne({ username: 'avaceratops' });
  const message = new Message({ author, title, msg });
  await message.save();
  messages[index] = message;
  console.log(`Added message: ${title}`);
}

async function createMessages() {
  console.log('Adding messages');
  await Promise.all([messageCreate(0, 'Test #1', 'This is a message')]);
  await Promise.all([messageCreate(1, 'Test #2', 'This is a message')]);
  await Promise.all([messageCreate(2, 'Test #3', 'This is a message')]);
}
