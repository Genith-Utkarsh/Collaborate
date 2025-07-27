const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborate');
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the problematic username index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (err) {
      console.log('username_1 index does not exist or already dropped');
    }

    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    // Drop all documents to start fresh
    const result = await usersCollection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} documents from users collection`);

    console.log('Database fixed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDatabase();
