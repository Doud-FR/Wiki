const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');
const groupsRoutes = require('./routes/groups');
const usersRoutes = require('./routes/users');
const { createAdminUser } = require('./seeders/adminSeeder');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  // Disable HSTS for local network environments to avoid forcing HTTPS
  hsts: false,
  // Configure CSP to not upgrade insecure requests for local development
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "upgrade-insecure-requests": null
    }
  }
}));

// CORS configuration
const corsOptions = {
  credentials: true
};

if (process.env.NODE_ENV === 'production') {
  // In production, allow same-origin requests and any configured origins
  corsOptions.origin = function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow same-origin requests
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      `http://localhost:${process.env.PORT || 3000}`,
      `http://127.0.0.1:${process.env.PORT || 3000}`
    ].filter(Boolean);
    
    // Add the current server's origin
    const serverOrigin = origin.replace(/:\d+$/, `:${process.env.PORT || 3000}`);
    allowedOrigins.push(serverOrigin);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production, be more permissive with local network IPs
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):/)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  };
} else {
  // In development, use the configured frontend URL
  corsOptions.origin = process.env.FRONTEND_URL || 'http://localhost:8080';
}

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
const startServer = async () => {
  let retries = 10;
  let lastError;
  
  while (retries > 0) {
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('Database connection established successfully.');

      // Sync database (create tables if they don't exist)
      await sequelize.sync({ force: false });
      console.log('Database synchronized successfully.');

      // Create admin user if none exists
      await createAdminUser();

      // Start server
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
      
      return; // Success, exit the loop
    } catch (error) {
      lastError = error;
      retries--;
      console.log(`Unable to connect to database. Retrying in 5 seconds... (${retries} retries left)`);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  console.error('Unable to start server after all retries:', lastError);
  process.exit(1);
};

startServer();

module.exports = app;