import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db | null> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stablepay';
  
  try {
    client = new MongoClient(mongoUri, {
      // MongoDB connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = mongoUri.includes('/') ? mongoUri.split('/').pop()?.split('?')[0] : 'stablepay';
    db = client.db(dbName || 'stablepay');
    
    // Test the connection
    await db.admin().ping();
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`🔧 Database: ${db.databaseName}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Running in mock database mode for local development');
    return null;
  }
}

export async function getMongoDB(): Promise<Db | null> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});
