// Run with: node scripts/fix-duplicate-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      const name = collection.collectionName;
      if (name.startsWith('system.')) continue;
      
      const indexes = await collection.indexes();
      const keys = new Map();
      const toDrop = [];
      
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keyStr = JSON.stringify(idx.key);
        
        if (keys.has(keyStr)) {
          toDrop.push(idx.name);
          console.log(`⚠️  Duplicate in ${name}: ${idx.name} (duplicates ${keys.get(keyStr)})`);
        } else {
          keys.set(keyStr, idx.name);
        }
      }
      
      if (toDrop.length > 0) {
        for (const idxName of toDrop) {
          await collection.dropIndex(idxName);
          console.log(`   ✅ Dropped ${name}.${idxName}`);
        }
      } else {
        console.log(`✅ ${name}: No duplicate indexes`);
      }
    }
    
    console.log('\n✅ All duplicate indexes removed!');
    console.log('Restart your application.\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDuplicateIndexes();