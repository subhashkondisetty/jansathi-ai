/**
 * @fileoverview CLI maintenance script to build and synchronize indexes across all Mongoose collections.
 *
 * Usage:
 *   npm run db:sync-indexes -w server
 */

import { connectDb, disconnectDb } from '../src/config/db.js';
import {
  User,
  Source,
  Document,
  DocumentPage,
  DocumentChunk,
  IngestionJob,
  Conversation,
  Claim,
  AuditLog,
} from '../src/models/index.js';

const models = [
  User,
  Source,
  Document,
  DocumentPage,
  DocumentChunk,
  IngestionJob,
  Conversation,
  Claim,
  AuditLog,
];

const syncAllIndexes = async () => {
  console.log('Connecting to MongoDB database...');
  await connectDb();

  console.log('\n--- Synchronizing Indexes Across Collections ---');

  for (const model of models) {
    const collectionName = model.collection.name;
    console.log(`\nCollection: [${collectionName}] (Model: ${model.modelName})`);

    try {
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      indexes.forEach((idx) => {
        const keys = Object.entries(idx.key)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        const extraFlags = [];
        if (idx.unique) extraFlags.push('UNIQUE');
        if (idx.expireAfterSeconds !== undefined) {
          extraFlags.push(`TTL(${idx.expireAfterSeconds}s)`);
        }
        if (idx.weights) {
          extraFlags.push(`TEXT_WEIGHTS(${JSON.stringify(idx.weights)})`);
        }
        const flagsStr = extraFlags.length ? ` [${extraFlags.join(', ')}]` : '';
        console.log(`  ✓ Index: "${idx.name}" -> { ${keys} }${flagsStr}`);
      });
    } catch (err) {
      console.error(`  ✗ Error synchronizing indexes for ${model.modelName}:`, err.message);
      throw err;
    }
  }

  console.log('\nAll indexes synchronized successfully.');
  await disconnectDb();
};

syncAllIndexes()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Index synchronization failed:', err);
    process.exit(1);
  });
