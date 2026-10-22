/**
 * FoodLoop - Express Application Entry Point
 * Mounts REST routes, middleware, and database services.
 */

import express from 'express';
import dotenv from 'dotenv';
import donationsRouter from './routes/donations.js';
import requestsRouter from './routes/requests.js';
import organizationsRouter from './routes/organizations.js';
import dashboardRouter from './routes/dashboard.js';
import systemRouter from './routes/system.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-simulated-user');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount REST API endpoints
app.use('/api/donations', donationsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/system', systemRouter);
app.use('/api', dashboardRouter); // For /api/reports

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'MealMitra', timestamp: new Date().toISOString() });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Start listening only when executed directly via node server/server.js
const isDirectExecution = process.argv[1] && process.argv[1].endsWith('server.js');
if (isDirectExecution) {
  app.listen(PORT, () => {
    console.log(`MealMitra API server is actively listening on port ${PORT}`);
  });
}

export default app;
