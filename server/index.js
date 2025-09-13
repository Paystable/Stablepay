import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { firestoreService } from './firestore-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com", "https:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.exchangerate-api.com", "https://mainnet.base.org", "https://*.base.org", "https://*.coinbase.com", "https://*.wallet.coinbase.com", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Override Cross-Origin-Opener-Policy for Coinbase Wallet compatibility
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Opener-Policy');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the built frontend
app.use(express.static(join(__dirname, '../dist/public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'stablepay-apy',
    database: firestoreService.isHealthy() ? 'connected' : 'fallback'
  });
});

// Early Access API endpoints
app.post('/api/early-access', async (req, res) => {
  try {
    const data = req.body;
    
    // Basic validation
    if (!data.email || !data.fullName) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    // Create submission using Firestore service
    const submission = await firestoreService.createEarlyAccessSubmission(data);
    
    res.status(201).json({
      success: true,
      message: 'Early access submission created successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error creating early access submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/early-access', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const formType = req.query.formType;

    const result = await firestoreService.getEarlyAccessSubmissions(page, limit, formType);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching early access submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/early-access/stats', async (req, res) => {
  try {
    const stats = await firestoreService.getEarlyAccessStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching early access stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Additional endpoints that might be needed
app.post('/api/early-access/submit', async (req, res) => {
  // Redirect to the main early access endpoint
  return res.redirect(307, '/api/early-access');
});

app.get('/api/metrics', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 StablePay server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Initialize Firestore connection
  if (firestoreService.isHealthy()) {
    console.log('✅ Firestore connection established');
  } else {
    console.log('⚠️ Firestore not available, using fallback storage');
  }
});
