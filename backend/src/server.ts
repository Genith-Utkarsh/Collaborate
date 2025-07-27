import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(limiter);

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:3000', // Development
  'http://localhost:3001', // Development fallback
  'https://gitxcollab.vercel.app', // Production Vercel URL
  process.env.FRONTEND_URL, // Additional production URL from env
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'collaborate-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Collaborate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      routes: '/api/debug/routes',
      auth: '/api/auth/*',
      projects: '/api/projects/*',
      users: '/api/users/*'
    },
    documentation: 'Visit /api/debug/routes for detailed endpoint information',
    deployment: 'Updated endpoint - should work now!'
  });
});

// Health check endpoint (works without database)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Database connection test endpoint
app.get('/api/test/db', async (_req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return res.status(500).json({
        status: 'error',
        message: 'MONGODB_URI environment variable is not set',
        hasMongoUri: false,
        mongoUriLength: 0
      });
    }

    // Test the connection
    const dbState = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Try a simple database operation
    const testQuery = await mongoose.connection.db?.admin().ping();
    
    return res.status(200).json({
      status: 'info',
      message: 'Database connection test',
      hasMongoUri: true,
      mongoUriLength: mongoUri.length,
      mongoUriPrefix: mongoUri.substring(0, 20) + '...',
      connectionState: stateNames[dbState] || 'unknown',
      connectionStateCode: dbState,
      pingResult: testQuery,
      databaseName: mongoose.connection.name
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Registration test endpoint
app.post('/api/test/register', async (req, res) => {
  try {
    console.log('Test registration endpoint hit');
    console.log('Request body:', req.body);
    
    // Just test if we can create a simple test document
    const testData = {
      test: true,
      timestamp: new Date(),
      body: req.body
    };
    
    res.status(200).json({
      status: 'success',
      message: 'Test registration endpoint working',
      data: testData,
      mongodb_connected: mongoose.connection.readyState === 1
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Test registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to list available routes
app.get('/api/debug/routes', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Available API routes',
    routes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'GET /api/auth/github',
        'GET /api/auth/github/callback',
        'GET /api/auth/me'
      ],
      projects: [
        'GET /api/projects',
        'GET /api/projects/:id',
        'GET /api/projects/:id/readme',
        'GET /api/projects/:id/contributors',
        'GET /api/projects/my-projects',
        'POST /api/projects',
        'PUT /api/projects/:id',
        'DELETE /api/projects/:id',
        'POST /api/projects/:id/like',
        'POST /api/projects/:id/comments',
        'POST /api/projects/:id/refresh-github'
      ],
      users: [
        'GET /api/users/profile',
        'PUT /api/users/profile',
        'GET /api/users/:id',
        'POST /api/users/:id/follow',
        'POST /api/users/:id/unfollow'
      ],
      system: [
        'GET /api/health',
        'GET /api/debug/routes'
      ]
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: 'GET /api/health',
      routes: 'GET /api/debug/routes',
      auth: 'GET|POST /api/auth/*',
      projects: 'GET|POST|PUT|DELETE /api/projects/*',
      users: 'GET|POST|PUT /api/users/*'
    },
    tip: 'Visit /api/debug/routes for a complete list of available endpoints'
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('⚠️  Server will start without database connection');
      console.error('📝 Please configure MONGODB_URI in your Render environment variables');
      return false;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('⚠️  Server will start without database connection');
    return false;
  }
}

// Start server
async function startServer() {
  try {
    const dbConnected = await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      
      if (!dbConnected) {
        console.log('⚠️  Database not connected - some features may not work');
        console.log('🔧 Health check available at /api/health');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit process - let the server start anyway
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (without database)`);
      console.log('🔧 Health check available at /api/health');
    });
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    process.exit(0);
  });
});

startServer();
