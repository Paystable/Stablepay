
// Load environment variables before any other imports
import { config } from "dotenv";

// Load .env file from project root
config({ path: '../.env' });
config({ path: '.env' });

// Validate Cashfree environment variables
const validateCashfreeConfig = () => {
  const requiredVars = [
    'CASHFREE_API_KEY',
    'CASHFREE_SECRET_KEY', 
    'CASHFREE_MERCHANT_ID',
    'CASHFREE_ENVIRONMENT'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ All Cashfree environment variables loaded successfully');
  console.log(`🔧 Environment: ${process.env.CASHFREE_ENVIRONMENT}`);
  
  return true;
};

// Validate MongoDB configuration
const validateMongoConfig = () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set, using MongoDB Atlas connection');
    process.env.MONGODB_URI = 'mongodb+srv://hello:Algoremit@stable-pay.pybfsvo.mongodb.net/stablepay';
  }

  console.log('✅ MongoDB configuration loaded');
  console.log(`🔧 MongoDB URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  return true;
};

// Validate on load
validateCashfreeConfig();
validateMongoConfig();

export { validateCashfreeConfig, validateMongoConfig };
